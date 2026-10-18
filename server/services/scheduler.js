import cron from 'node-cron';
import DoseLog from '../models/DoseLog.js';
import Medicine from '../models/Medicine.js';
import Notification from '../models/Notification.js';
import CarePlan from '../models/CarePlan.js';

/**
 * Background Scheduler Service
 * Handles periodic tasks for reminders, dose generation, and expiry checks
 */

console.log('🕐 Scheduler service starting...');

/**
 * Generate upcoming doses for active medicines
 * Runs every hour
 */
cron.schedule('0 * * * *', async () => {
  console.log('Running dose generation task...');

  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find all active medicines with schedules
    const medicines = await Medicine.find({
      status: 'active',
      'schedule.type': { $exists: true, $ne: 'as-needed' }
    }).populate('user familyMember');

    let dosesCreated = 0;

    for (const medicine of medicines) {
      if (!medicine.schedule || !medicine.schedule.times) continue;

      // Generate doses for each scheduled time
      for (const timeString of medicine.schedule.times) {
        const [hours, minutes] = timeString.split(':');
        const scheduledTime = new Date(now);
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime < now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Only create if within next 24 hours
        if (scheduledTime > next24Hours) continue;

        // Check if dose already exists
        const existingDose = await DoseLog.findOne({
          medicine: medicine._id,
          scheduledTime: {
            $gte: new Date(scheduledTime.getTime() - 5 * 60 * 1000), // 5 min before
            $lte: new Date(scheduledTime.getTime() + 5 * 60 * 1000)  // 5 min after
          }
        });

        if (!existingDose) {
          await DoseLog.create({
            medicine: medicine._id,
            user: medicine.user._id,
            familyMember: medicine.familyMember?._id,
            scheduledTime,
            status: 'pending',
          });
          dosesCreated++;
        }
      }
    }

    console.log(`✓ Dose generation complete: ${dosesCreated} doses created`);
  } catch (error) {
    console.error('✗ Dose generation error:', error);
  }
});

/**
 * Send dose reminders
 * Runs every 5 minutes
 */
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const next15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

    // Find pending doses in the next 15 minutes that haven't been reminded
    const upcomingDoses = await DoseLog.find({
      status: 'pending',
      scheduledTime: {
        $gte: now,
        $lte: next15Minutes
      },
      reminderSent: { $ne: true },
      $or: [
        { snoozedUntil: { $exists: false } },
        { snoozedUntil: { $lte: now } }
      ]
    })
    .populate('medicine', 'name strength form')
    .populate('user', 'name preferences')
    .populate('familyMember', 'name displayColor notificationSharing');

    for (const dose of upcomingDoses) {
      // Create in-app notification
      await Notification.create({
        user: dose.user._id,
        familyMember: dose.familyMember?._id,
        type: 'dose-reminder',
        title: 'Medicine Reminder',
        message: `Time to take ${dose.medicine.name}${dose.medicine.strength ? ' ' + dose.medicine.strength : ''}`,
        priority: 'normal',
        medicine: dose.medicine._id,
        doseLog: dose._id,
        scheduledFor: dose.scheduledTime,
        sentAt: new Date(),
        channels: {
          inApp: true,
          push: dose.user.preferences?.notifications?.push || false,
        },
      });

      // Mark reminder as sent
      dose.reminderSent = true;
      dose.reminderSentAt = new Date();
      await dose.save();
    }

    if (upcomingDoses.length > 0) {
      console.log(`✓ Sent ${upcomingDoses.length} dose reminders`);
    }
  } catch (error) {
    console.error('✗ Reminder sending error:', error);
  }
});

/**
 * Mark missed doses
 * Runs every 10 minutes
 */
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();
    const missedThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    const result = await DoseLog.updateMany(
      {
        status: 'pending',
        scheduledTime: { $lt: missedThreshold }
      },
      {
        status: 'missed'
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✓ Marked ${result.modifiedCount} doses as missed`);

      // Create missed-dose notifications
      const missedDoses = await DoseLog.find({
        status: 'missed',
        scheduledTime: {
          $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Last 2 hours
          $lt: missedThreshold
        }
      })
      .populate('medicine', 'name strength')
      .populate('user', 'name')
      .populate('familyMember', 'name displayColor');

      for (const dose of missedDoses) {
        // Check if notification already exists
        const existingNotification = await Notification.findOne({
          user: dose.user._id,
          doseLog: dose._id,
          type: 'missed-dose'
        });

        if (!existingNotification) {
          await Notification.create({
            user: dose.user._id,
            familyMember: dose.familyMember?._id,
            type: 'missed-dose',
            title: 'Missed Dose',
            message: `Missed dose: ${dose.medicine.name}`,
            priority: 'high',
            medicine: dose.medicine._id,
            doseLog: dose._id,
            channels: { inApp: true },
          });
        }
      }
    }
  } catch (error) {
    console.error('✗ Missed dose marking error:', error);
  }
});

/**
 * Check for low stock
 * Runs every hour
 */
cron.schedule('0 * * * *', async () => {
  try {
    const medicines = await Medicine.find({
      status: 'active'
    })
    .populate('user', 'name')
    .populate('familyMember', 'name displayColor');

    let alertsCreated = 0;

    for (const medicine of medicines) {
      if (medicine.stock.quantity <= medicine.stock.lowStockThreshold) {
        // Check if recent alert exists (within last 24 hours)
        const recentAlert = await Notification.findOne({
          user: medicine.user._id,
          medicine: medicine._id,
          type: 'low-stock',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!recentAlert) {
          await Notification.create({
            user: medicine.user._id,
            familyMember: medicine.familyMember?._id,
            type: 'low-stock',
            title: 'Low Stock Alert',
            message: `${medicine.name} is running low (${medicine.stock.quantity} ${medicine.stock.unit} remaining)`,
            priority: 'normal',
            medicine: medicine._id,
            channels: { inApp: true },
          });
          alertsCreated++;
        }
      }
    }

    if (alertsCreated > 0) {
      console.log(`✓ Created ${alertsCreated} low stock alerts`);
    }
  } catch (error) {
    console.error('✗ Low stock check error:', error);
  }
});

/**
 * Check for expiring medicines
 * Runs daily at 9 AM
 */
cron.schedule('0 9 * * *', async () => {
  try {
    const now = new Date();
    const checkpoints = [
      { days: 30, label: '30 days' },
      { days: 7, label: '7 days' },
      { days: 1, label: '1 day' }
    ];

    let alertsCreated = 0;

    for (const checkpoint of checkpoints) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + checkpoint.days);

      // Find medicines expiring on target date
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const expiringMedicines = await Medicine.find({
        status: 'active',
        expiryDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
      .populate('user', 'name')
      .populate('familyMember', 'name displayColor');

      for (const medicine of expiringMedicines) {
        await Notification.create({
          user: medicine.user._id,
          familyMember: medicine.familyMember?._id,
          type: 'expiry',
          title: 'Expiry Alert',
          message: `${medicine.name} expires in ${checkpoint.label}`,
          priority: checkpoint.days <= 7 ? 'high' : 'normal',
          medicine: medicine._id,
          channels: { inApp: true },
        });
        alertsCreated++;
      }
    }

    if (alertsCreated > 0) {
      console.log(`✓ Created ${alertsCreated} expiry alerts`);
    }
  } catch (error) {
    console.error('✗ Expiry check error:', error);
  }
});

/**
 * Check care plan reviews
 * Runs daily at 10 AM
 */
cron.schedule('0 10 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const carePlans = await CarePlan.find({
      status: { $in: ['active', 'extended'] },
      reviewDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('user', 'name')
    .populate('familyMember', 'name displayColor');

    for (const plan of carePlans) {
      // Check if notification already exists
      const existingNotification = await Notification.findOne({
        user: plan.user._id,
        carePlan: plan._id,
        type: 'care-plan-review',
        createdAt: { $gte: today }
      });

      if (!existingNotification) {
        await Notification.create({
          user: plan.user._id,
          familyMember: plan.familyMember?._id,
          type: 'care-plan-review',
          title: 'Care Plan Review',
          message: `Care plan "${plan.title}" is due for review`,
          priority: 'high',
          carePlan: plan._id,
          channels: { inApp: true },
        });

        // Update plan status
        plan.status = 'under-review';
        await plan.save();
      }
    }

    if (carePlans.length > 0) {
      console.log(`✓ Created ${carePlans.length} care plan review notifications`);
    }
  } catch (error) {
    console.error('✗ Care plan review check error:', error);
  }
});

console.log('✓ Scheduler service initialized');

export default {
  name: 'scheduler',
  status: 'running'
};

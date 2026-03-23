// features/reminders/reminder.service.ts

import { prisma } from "@/server/db/prisma"

export class ReminderService {

  /**
   * Create a water reminder for a plant.
   * Verifies plant belongs to the user.
   */
  static async create(userId: string, plantId: string, time: Date) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found or does not belong to this user")

    return prisma.reminder.create({
      data: { userId, plantId, time },
    })
  }

  /**
   * Get all upcoming reminders for a user, sorted by time ascending.
   */
  static async getUserReminders(userId: string) {
    return prisma.reminder.findMany({
      where:   { userId },
      include: {
        plant: {
          select: { id: true, seedType: true, stage: true, qrCode: true },
        },
      },
      orderBy: { time: "asc" },
    })
  }

  /**
   * Get upcoming reminders only (time in the future).
   */
  static async getUpcoming(userId: string) {
    return prisma.reminder.findMany({
      where: {
        userId,
        time: { gte: new Date() },
      },
      include: {
        plant: {
          select: { id: true, seedType: true, stage: true, qrCode: true },
        },
      },
      orderBy: { time: "asc" },
    })
  }

  /**
   * Delete a reminder. Verifies ownership.
   */
  static async delete(reminderId: string, userId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, userId },
    })
    if (!reminder) throw new Error("Reminder not found")

    return prisma.reminder.delete({ where: { id: reminderId } })
  }

  /**
   * Delete all reminders for a plant (e.g. when plant is archived).
   */
  static async deleteByPlant(plantId: string, userId: string) {
    return prisma.reminder.deleteMany({
      where: { plantId, userId },
    })
  }
}
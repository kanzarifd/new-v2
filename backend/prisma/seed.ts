import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing entries
  await prisma.banc.deleteMany();

  // Seed with client data
  await prisma.banc.createMany({
    data: [
      { cin: '12345678', name: 'John Doe', full_name: 'John Michael Doe' },
      { cin: '23456789', name: 'Sarah Smith', full_name: 'Sarah Elizabeth Smith' },
      { cin: '34567890', name: 'Mike Johnson', full_name: 'Michael Robert Johnson' },
      { cin: '45678901', name: 'Emma Wilson', full_name: 'Emma Grace Wilson' },
      { cin: '56789012', name: 'David Brown', full_name: 'David James Brown' },
      { cin: '67890123', name: 'Linda Davis', full_name: 'Linda Marie Davis' },
      { cin: '78901234', name: 'Chris Miller', full_name: 'Christopher Alan Miller' },
      { cin: '14668382', name: 'fadi', full_name: 'fadi kanzari' },
      { cin: '14459874', name: 'chaima', full_name: 'chaima jendoubi' }
      






    ],
    skipDuplicates: true,
  });
  console.log('Successfully seeded client data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();

  // Physics
  const physics = await prisma.subject.create({
    data: {
      name: "Physics",
      description: "NEET Physics syllabus covering mechanics, thermodynamics, electricity, and modern physics",
      topics: {
        create: [
          { name: "Mechanics", description: "Laws of Motion, Work, Energy and Power, Rotational Motion" },
          { name: "Thermodynamics", description: "Heat, Kinetic Theory of Gases, Laws of Thermodynamics" },
          { name: "Electricity and Magnetism", description: "Electric Charges, Current, Magnetic Effects" },
          { name: "Optics", description: "Ray Optics, Wave Optics, Light and Optical Instruments" },
          { name: "Modern Physics", description: "Photoelectric Effect, Atoms and Nuclei" },
          { name: "Waves", description: "Wave Motion, Sound Waves, Doppler Effect" }
        ]
      }
    }
  });

  // Chemistry
  const chemistry = await prisma.subject.create({
    data: {
      name: "Chemistry",
      description: "NEET Chemistry covering physical, organic, and inorganic chemistry",
      topics: {
        create: [
          { name: "Physical Chemistry", description: "Chemical Kinetics, Thermodynamics, Solutions" },
          { name: "Organic Chemistry", description: "Hydrocarbons, Alcohols, Aldehydes, Ketones" },
          { name: "Inorganic Chemistry", description: "Periodic Table, Chemical Bonding, Coordination Compounds" },
          { name: "Electrochemistry", description: "Electrolysis, Batteries, Corrosion" },
          { name: "Chemical Equilibrium", description: "Acid-Base Equilibria, Ionic Equilibrium" },
          { name: "States of Matter", description: "Gases, Liquids, Solids, Solutions" }
        ]
      }
    }
  });

  // Biology
  const biology = await prisma.subject.create({
    data: {
      name: "Biology",
      description: "NEET Biology covering botany and zoology",
      topics: {
        create: [
          { name: "Cell Biology", description: "Cell Structure, Cell Division, Biomolecules" },
          { name: "Human Physiology", description: "Digestive System, Respiratory System, Circulatory System" },
          { name: "Genetics", description: "Inheritance, Molecular Basis of Inheritance" },
          { name: "Plant Physiology", description: "Photosynthesis, Plant Growth, Plant Hormones" },
          { name: "Evolution", description: "Origin of Life, Natural Selection, Human Evolution" },
          { name: "Ecology", description: "Ecosystem, Biodiversity, Environmental Issues" }
        ]
      }
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type ItemInput = {
  nameAr: string;
  nameFr: string;
  descriptionAr?: string;
  descriptionFr?: string;
  noteAr?: string;
  noteFr?: string;
  price?: number;
  priceLarge?: number;
  comingSoon?: boolean;
  photoUrl?: string;
};

type CategoryInput = {
  nameAr: string;
  nameFr: string;
  items: ItemInput[];
};

type SectionInput = {
  nameAr: string;
  nameFr: string;
  categories: CategoryInput[];
};

// Menu taken from the printed Hamdouni's Chicken menu (Menu.png).
// PRICES ARE PLACEHOLDERS — the printed menu has none. Update them in
// /admin/menu (or here, then re-run `npm run db:seed`).
const menu: SectionInput[] = [
  {
    nameAr: "المشويات",
    nameFr: "Grillades",
    categories: [
      {
        nameAr: "دجاج مشوي",
        nameFr: "Poulet Grillé",
        items: [
          {
            nameFr: "1/4 Kg Poulet Grillé",
            nameAr: "ربع كيلو دجاج مشوي",
            descriptionAr: "قطع دجاج متبلة ومشوية على الفحم",
            descriptionFr: "Morceaux de poulet marinés, grillés au feu de bois",
            price: 25,
            photoUrl: "/menu/items/poulet-quart.jpg",
          },
          {
            nameFr: "1/2 Kg Poulet Grillé",
            nameAr: "نصف كيلو دجاج مشوي",
            descriptionAr: "قطع دجاج متبلة ومشوية على الفحم",
            descriptionFr: "Morceaux de poulet marinés, grillés au feu de bois",
            price: 45,
            photoUrl: "/menu/items/poulet-demi.jpg",
          },
          {
            nameFr: "1 Kg Poulet Grillé",
            nameAr: "كيلو دجاج مشوي",
            descriptionAr: "قطع دجاج متبلة ومشوية على الفحم — مثالي للمشاركة",
            descriptionFr: "Morceaux de poulet marinés, grillés au feu de bois — idéal à partager",
            price: 85,
            photoUrl: "/menu/items/poulet-kilo.jpg",
          },
        ],
      },
      {
        nameAr: "سندويتشات",
        nameFr: "Sandwichs",
        items: [
          {
            nameFr: "Takos Beldi",
            nameAr: "طاكوس بلدي",
            descriptionAr: "دجاج مشوي - بطاطس مقلية - خضار - صلصة",
            descriptionFr: "Poulet grillé - frites - crudités - sauce",
            price: 30,
            photoUrl: "/menu/items/takos-beldi.jpg",
          },
        ],
      },
      {
        nameAr: "العروض",
        nameFr: "Formules",
        items: [
          {
            nameFr: "Coca-Cola 1L + Poulet",
            nameAr: "كوكا كولا 1 لتر + دجاج",
            descriptionAr: "دجاج مشوي - بطاطس مقلية - كوكا كولا 1 لتر",
            descriptionFr: "Poulet grillé - frites - Coca-Cola 1L",
            price: 100,
            photoUrl: "/menu/items/coca-poulet.jpg",
          },
        ],
      },
    ],
  },
  {
    nameAr: "السلطات والمرافقات",
    nameFr: "Salades & Accompagnements",
    categories: [
      {
        nameAr: "السلطات",
        nameFr: "Salades",
        items: [
          {
            nameFr: "Salade Niçoise",
            nameAr: "سلطة نيسواز",
            descriptionAr: "تونة - خس - طماطم - بيض مسلوق - زيتون أسود - بصل",
            descriptionFr: "Thon - laitue - tomates - œuf dur - olives noires - oignon",
            price: 25,
            photoUrl: "/menu/items/salade-nicoise.jpg",
          },
          {
            nameFr: "Salade Marocaine",
            nameAr: "سلطة مغربية",
            descriptionAr: "طماطم - خيار - بصل - فلفل - بقدونس - زيت الزيتون",
            descriptionFr: "Tomates - concombre - oignon - poivron - persil - huile d'olive",
            price: 15,
            photoUrl: "/menu/items/salade-marocaine.jpg",
          },
        ],
      },
      {
        nameAr: "المرافقات",
        nameFr: "Accompagnements",
        items: [
          {
            nameFr: "Frites",
            nameAr: "بطاطس مقلية",
            price: 15,
            photoUrl: "/menu/items/frites.jpg",
          },
        ],
      },
    ],
  },
  {
    nameAr: "المشروبات",
    nameFr: "Boissons",
    categories: [
      {
        nameAr: "المشروبات",
        nameFr: "Boissons",
        items: [
          {
            nameFr: "Eau 1L",
            nameAr: "ماء 1 لتر",
            price: 8,
            photoUrl: "/menu/items/eau.jpg",
          },
          {
            nameFr: "Thé + Eau",
            nameAr: "شاي + ماء",
            descriptionAr: "أتاي بالنعناع مع قنينة ماء",
            descriptionFr: "Thé à la menthe avec une bouteille d'eau",
            price: 15,
            photoUrl: "/menu/items/the-eau.jpg",
          },
        ],
      },
    ],
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin user ready: ${email}`);

  await prisma.feedback.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.menuSection.deleteMany();

  for (let s = 0; s < menu.length; s++) {
    const section = menu[s];
    const createdSection = await prisma.menuSection.create({
      data: { nameAr: section.nameAr, nameFr: section.nameFr, sortOrder: s },
    });

    for (let c = 0; c < section.categories.length; c++) {
      const category = section.categories[c];
      const createdCategory = await prisma.menuCategory.create({
        data: {
          sectionId: createdSection.id,
          nameAr: category.nameAr,
          nameFr: category.nameFr,
          sortOrder: c,
        },
      });

      for (let i = 0; i < category.items.length; i++) {
        const item = category.items[i];
        await prisma.menuItem.create({
          data: {
            categoryId: createdCategory.id,
            nameAr: item.nameAr,
            nameFr: item.nameFr,
            descriptionAr: item.descriptionAr,
            descriptionFr: item.descriptionFr,
            noteAr: item.noteAr,
            noteFr: item.noteFr,
            price: item.price,
            priceLarge: item.priceLarge,
            comingSoon: item.comingSoon ?? false,
            photoUrl: item.photoUrl,
            sortOrder: i,
          },
        });
      }
    }
  }

  console.log("Menu seeded: Hamdouni's Chicken menu");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// club-web/features/membership/components/homepage/CategoriesCarousel.tsx
"use client";

import { useRouter } from "next/navigation";
import { Category, CategoryCard } from "./CategoryCard";
import { Carousel } from "@/features/shared/components/Carousel";

interface CategoryCarouselProps {
  categories: Category[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const router = useRouter();

  return (
    <Carousel
      items={categories}
      keyExtractor={(category) => category.id}
      itemClassName="w-[140px]"
      gapClassName="gap-3"
      minItemsForNav={8}
      scrollAmount={200}
      renderItem={(category) => (
        <CategoryCard
          {...category}
          onClick={() => router.push(`/categories/${category.id}`)}
        />
      )}
    />
  );
}

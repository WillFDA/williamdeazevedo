import { getProjectById } from "@/data/projects";
import { temoignages } from "@/data/temoignage";

const testimonialImages = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/temoignages/*.{jpg,jpeg,png,webp}",
  { eager: true }
);

export const getPublishedTestimonials = () =>
  temoignages
    .filter((testimonial) => testimonial.published !== false)
    .map((testimonial) => {
      const project = getProjectById(testimonial.projectId);

      if (!project) {
        throw new Error(`Projet introuvable pour ${testimonial.id}`);
      }

      return {
        ...testimonial,
        href: project.href,
        project,
        image: testimonial.imageFile
          ? testimonialImages[`../assets/temoignages/${testimonial.imageFile}`]
              ?.default
          : undefined,
      };
    });

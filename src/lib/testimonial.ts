import { z } from "zod";

export const TESTIMONIAL_BODY_MIN = 20;
export const TESTIMONIAL_BODY_MAX = 500;

/** Formulaire de témoignage : validé dans le navigateur et à nouveau côté serveur. Le consentement est obligatoire. */
export const testimonialSchema = z.object({
  firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(40),
  city: z.string().trim().max(80).optional(),
  body: z.string().trim().min(TESTIMONIAL_BODY_MIN, `Écrivez au moins ${TESTIMONIAL_BODY_MIN} caractères.`).max(TESTIMONIAL_BODY_MAX),
  consent: z.literal(true, { error: "Cochez la case pour autoriser la publication." }),
});
export type TestimonialInput = z.input<typeof testimonialSchema>;

"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { TESTIMONIALS, unsplashUrl } from "@/lib/marketplace";
import { Stars } from "./Stars";

const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/**
 * Social proof.
 *
 * The product has not launched, so these are sample reviews, and the section
 * says so where a reader will actually see it. Everything else about the
 * section is built as the real one will be, so swapping in genuine reviews
 * later is a data change and nothing more.
 */
export function TestimonialSection() {
  return (
    <section id="testimonials">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Reviews</span>
          <h2>The experience we are building towards</h2>
          <p>
            Sample reviews, not real ones — we have not launched yet, and we are not going to
            invent customers. This is the outcome every part of the product is designed to produce.
          </p>
        </div>

        <div className="review-summary">
          <Stars rating={5} />
          <span className="review-summary__score">5.0</span>
          <span className="review-summary__meta">
            target rating across every completed job · sample data
          </span>
        </div>

        <motion.div
          className="testimonial-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.figure className="testimonial-card" key={testimonial.id} variants={revealUp}>
              <Stars rating={testimonial.rating} />

              <blockquote>{testimonial.quote}</blockquote>

              <figcaption>
                <Image
                  className="testimonial-card__avatar"
                  src={unsplashUrl(testimonial.avatar, 96, 96)}
                  alt=""
                  width={44}
                  height={44}
                />
                <span>
                  <span className="testimonial-card__name">{testimonial.name}</span>
                  <span className="testimonial-card__meta">
                    {testimonial.location} · {testimonial.service}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { Icon } from "@/components/ui/Icon";
import { unsplashUrl } from "@/data/marketplace";
import {
  SERVICE_CATEGORIES,
  TRENDING,
  TRENDING_TAB,
  bookingHref,
  categoryHref,
  fromPriceOf,
} from "@/data/services";

/**
 * The landing page's service browser: a row of category tabs, the jobs in the
 * chosen category as quick links, and a feature card describing it.
 *
 * Built on React Aria's Tabs, so it is a real ARIA tab set: arrow keys move
 * between categories, the selected tab is announced, and each panel is
 * labelled by its tab. On narrow screens the tab row scrolls sideways rather
 * than wrapping, so every category stays one swipe or one arrow key away.
 *
 * Each job chip goes straight into booking that job. The feature card's button
 * goes to the category page, for anyone who wants to read more first.
 */
export function ServiceExplorer() {
  const tabs = [...SERVICE_CATEGORIES, TRENDING_TAB];

  return (
    <section id="services" className="svc-explorer">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Services</span>
          <h2>What do you need done?</h2>
          <p>
            Pick a service to see the jobs people book most, then choose one to get started.
            Or skip this entirely and describe the job in your own words at the top of the page.
          </p>
        </div>

        <Tabs className="svc-tabs" defaultSelectedKey={SERVICE_CATEGORIES[0].slug}>
          <TabList className="svc-tabs__list" aria-label="Service categories">
            {tabs.map((tab) => (
              <Tab key={tab.slug} id={tab.slug} className="svc-tab">
                <span className="svc-tab__icon" aria-hidden="true">
                  <Icon name={tab.icon} />
                </span>
                <span className="svc-tab__label">{tab.name}</span>
              </Tab>
            ))}
          </TabList>

          {SERVICE_CATEGORIES.map((category) => (
            <TabPanel key={category.slug} id={category.slug} className="svc-panel">
              <JobChips
                jobs={category.services.map((service) => ({
                  key: service.slug,
                  label: service.name,
                  href: bookingHref(category.slug, service.slug),
                }))}
              />
              <FeatureCard
                title={category.name}
                highlights={category.highlights}
                photo={category.photo}
                photoAlt={category.photoAlt}
                fromPrice={fromPriceOf(category)}
                href={categoryHref(category.slug)}
                cta={`See all ${category.name.toLowerCase()} jobs`}
              />
            </TabPanel>
          ))}

          <TabPanel id={TRENDING_TAB.slug} className="svc-panel">
            <JobChips
              jobs={TRENDING.map(({ category, service }) => ({
                key: `${category.slug}-${service.slug}`,
                label: service.name,
                href: bookingHref(category.slug, service.slug),
              }))}
            />
            <FeatureCard
              title={TRENDING_TAB.name}
              highlights={TRENDING_TAB.highlights}
              photo={TRENDING_TAB.photo}
              photoAlt={TRENDING_TAB.photoAlt}
              fromPrice={Math.min(...TRENDING.map(({ service }) => service.fromPrice))}
              href="/services"
              cta="Browse every service"
            />
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
}

function JobChips({ jobs }: { jobs: { key: string; label: string; href: string }[] }) {
  return (
    <ul className="svc-chips">
      {jobs.map((job) => (
        <li key={job.key}>
          <Link className="svc-chip" href={job.href}>
            <span className="visually-hidden">Book </span>
            {job.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({
  title,
  highlights,
  photo,
  photoAlt,
  fromPrice,
  href,
  cta,
}: {
  title: string;
  highlights: string[];
  photo: string;
  photoAlt: string;
  fromPrice: number;
  href: string;
  cta: string;
}) {
  return (
    <div className="svc-feature">
      <div className="svc-feature__card">
        <h3>{title}</h3>
        <ul className="svc-feature__list">
          {highlights.map((line) => (
            <li key={line}>
              <Icon name="check" className="svc-feature__tick" />
              {line}
            </li>
          ))}
        </ul>
        <p className="svc-feature__price">
          Most jobs from <strong>£{fromPrice}</strong> an hour
        </p>
        <Link className="btn btn-primary" href={href}>
          {cta}
        </Link>
      </div>
      <div className="svc-feature__photo">
        <Image
          src={unsplashUrl(photo, 1100, 760)}
          alt={photoAlt}
          fill
          sizes="(max-width: 860px) 100vw, 60vw"
        />
      </div>
    </div>
  );
}

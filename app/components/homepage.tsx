import type { Profile, StackCategory, Experience, ShippedApp, Writing } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";

interface HomepageProps {
  profile: Profile;
  skills: StackCategory[];
  experience: Experience[];
  apps: ShippedApp[];
  posts: Writing[];
}

export function Homepage({ profile, skills, experience, apps, posts }: HomepageProps) {
  return (
    <main className="container">
      <header className="topbar">
        <p>{profile.name}</p>
        <ThemeToggle />
      </header>

      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">{profile.role}</h1>
        <p>{profile.bio.short}</p>
        <p>{profile.location}</p>
      </section>

      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading">Skills &amp; Tech Stack</h2>
        <ul>
          {skills.map((category) => (
            <li key={category.category}>
              <strong>{category.category}</strong>: {category.items.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="apps-heading">
        <h2 id="apps-heading">Mobile Apps</h2>
        {apps.map((app) => (
          <article key={app.name} className="card">
            <h3>{app.name}</h3>
            {app.summary ? <p>{app.summary}</p> : null}
            <p className="inline-links">
              {app.appStoreUrl ? (
                <a href={app.appStoreUrl} target="_blank" rel="noreferrer">
                  App Store
                </a>
              ) : null}
              {app.googlePlayUrl ? (
                <a href={app.googlePlayUrl} target="_blank" rel="noreferrer">
                  Google Play
                </a>
              ) : null}
            </p>
          </article>
        ))}
      </section>

      <section aria-labelledby="resume-heading">
        <h2 id="resume-heading">Resume</h2>
        <a href={profile.resumeUrl} download>
          Download Resume
        </a>
      </section>

      <section aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience Timeline</h2>
        <ol>
          {experience.map((item) => (
            <li key={`${item.company}-${item.period}`} className="card">
              <h3>
                {item.role} at {item.company}
              </h3>
              <p>{item.period}</p>
              <p>{item.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="blog-heading">
        <h2 id="blog-heading">Blog Preview</h2>
        {posts.map((post) => (
          <article key={post.title} className="card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href={post.link} target="_blank" rel="noreferrer">
              Read more
            </a>
          </article>
        ))}
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact &amp; Social</h2>
        <p>
          Email: <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <ul>
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a href={social.url} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

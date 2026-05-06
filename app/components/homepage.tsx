import type { BlogPost, Experience, MobileApp, Profile, Skill } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";

interface HomepageProps {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  apps: MobileApp[];
  posts: BlogPost[];
}

export function Homepage({ profile, skills, experience, apps, posts }: HomepageProps) {
  return (
    <main className="container">
      <header className="topbar">
        <p>{profile.name}</p>
        <ThemeToggle />
      </header>

      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">{profile.title}</h1>
        <p>{profile.bio}</p>
        <p>{profile.location}</p>
      </section>

      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading">Skills &amp; Tech Stack</h2>
        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              {skill.name} <span className="muted">({skill.category})</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="apps-heading">
        <h2 id="apps-heading">Mobile Apps</h2>
        {apps.map((app) => (
          <article key={app.id} className="card">
            <h3>{app.name}</h3>
            <p>{app.description}</p>
            <p className="inline-links">
              <a href={app.appStoreUrl} target="_blank" rel="noreferrer">
                App Store
              </a>
              <a href={app.googlePlayUrl} target="_blank" rel="noreferrer">
                Google Play
              </a>
            </p>
          </article>
        ))}
      </section>

      <section aria-labelledby="resume-heading">
        <h2 id="resume-heading">Resume</h2>
        <p>Updated: {profile.resumeUpdatedAt}</p>
        <a href="/resume.pdf" download>
          Download Resume
        </a>
      </section>

      <section aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience Timeline</h2>
        <ol>
          {experience.map((item) => (
            <li key={item.id} className="card">
              <h3>
                {item.role} at {item.company}
              </h3>
              <p>
                {item.startDate} - {item.endDate ?? "Present"}
              </p>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="blog-heading">
        <h2 id="blog-heading">Blog Preview</h2>
        {posts.map((post) => (
          <article key={post.id} className="card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.slug}`}>Read more</a>
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
              <a href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

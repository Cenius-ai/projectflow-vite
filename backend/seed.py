"""Seed demo data: demo users, projects with tasks, and team members."""

import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import User, Project, Task, ProjectMember
from auth import hash_password


async def seed_demo_data(db: AsyncSession):
    # Check if already seeded
    result = await db.execute(select(User).where(User.email == "cenius@cenius.ai"))
    if result.scalar_one_or_none() is not None:
        return  # Already seeded

    now = datetime.datetime.utcnow()

    # ── Demo users ──────────────────────────────────────────────
    cenius = User(
        email="cenius@cenius.ai",
        name="Cenius Admin",
        hashed_password=hash_password("cenius"),
        created_at=now,
    )
    admin = User(
        email="admin@example.com",
        name="Alex Rivera",
        hashed_password=hash_password("admin"),
        created_at=now,
    )
    maya = User(
        email="maya.chen@example.com",
        name="Maya Chen",
        hashed_password=hash_password("password123"),
        created_at=now,
    )
    james = User(
        email="james.wilson@example.com",
        name="James Wilson",
        hashed_password=hash_password("password123"),
        created_at=now,
    )
    sofia = User(
        email="sofia.patel@example.com",
        name="Sofia Patel",
        hashed_password=hash_password("password123"),
        created_at=now,
    )

    db.add_all([cenius, admin, maya, james, sofia])
    await db.flush()

    # ── Projects ─────────────────────────────────────────────────
    website_redesign = Project(
        name="Website Redesign",
        description="Complete overhaul of the company marketing site with new brand identity and improved conversion funnels.",
        created_by_user_id=cenius.id,
        created_at=now - datetime.timedelta(days=30),
    )
    mobile_app = Project(
        name="Mobile App v2",
        description="Next major release of the iOS and Android apps including offline mode, dark theme, and push notification overhaul.",
        created_by_user_id=cenius.id,
        created_at=now - datetime.timedelta(days=14),
    )
    api_platform = Project(
        name="API Platform Upgrade",
        description="Migrate the public API to GraphQL, add rate limiting, improve developer documentation, and release SDKs for Python and JavaScript.",
        created_by_user_id=admin.id,
        created_at=now - datetime.timedelta(days=7),
    )

    db.add_all([website_redesign, mobile_app, api_platform])
    await db.flush()

    # ── Project Members ──────────────────────────────────────────
    members = [
        ProjectMember(project_id=website_redesign.id, user_id=cenius.id, role="owner", joined_at=now - datetime.timedelta(days=30)),
        ProjectMember(project_id=website_redesign.id, user_id=maya.id, role="designer", joined_at=now - datetime.timedelta(days=28)),
        ProjectMember(project_id=website_redesign.id, user_id=james.id, role="developer", joined_at=now - datetime.timedelta(days=25)),
        ProjectMember(project_id=mobile_app.id, user_id=cenius.id, role="owner", joined_at=now - datetime.timedelta(days=14)),
        ProjectMember(project_id=mobile_app.id, user_id=sofia.id, role="developer", joined_at=now - datetime.timedelta(days=12)),
        ProjectMember(project_id=mobile_app.id, user_id=maya.id, role="designer", joined_at=now - datetime.timedelta(days=10)),
        ProjectMember(project_id=api_platform.id, user_id=admin.id, role="owner", joined_at=now - datetime.timedelta(days=7)),
        ProjectMember(project_id=api_platform.id, user_id=james.id, role="developer", joined_at=now - datetime.timedelta(days=6)),
        ProjectMember(project_id=api_platform.id, user_id=sofia.id, role="developer", joined_at=now - datetime.timedelta(days=5)),
    ]
    db.add_all(members)
    await db.flush()

    # ── Tasks for Website Redesign ───────────────────────────────
    wr_tasks = [
        Task(project_id=website_redesign.id, title="Audit current site pages and content", description="Inventory all existing pages, note outdated content, and flag SEO issues.", status="done", order=1, assignee_id=maya.id, created_at=now - datetime.timedelta(days=29)),
        Task(project_id=website_redesign.id, title="Create new visual design system in Figma", description="Define typography scale, color palette, spacing system, and component library for the redesign.", status="done", order=2, assignee_id=maya.id, created_at=now - datetime.timedelta(days=25)),
        Task(project_id=website_redesign.id, title="Build reusable header and footer components", description="Implement responsive header with navigation and footer with sitemap links using the new design tokens.", status="done", order=3, assignee_id=james.id, created_at=now - datetime.timedelta(days=20)),
        Task(project_id=website_redesign.id, title="Implement homepage hero section", description="Build the new hero with animated headline, CTA buttons, and background illustration. Must be accessible and performant.", status="in_progress", order=4, assignee_id=james.id, created_at=now - datetime.timedelta(days=10)),
        Task(project_id=website_redesign.id, title="Design and build pricing page", description="Create comparison table with three tiers, FAQ accordion, and enterprise contact form.", status="in_progress", order=5, assignee_id=james.id, created_at=now - datetime.timedelta(days=5)),
        Task(project_id=website_redesign.id, title="Set up CMS collections for case studies", description="Define content model for case study entries with client, industry, challenge, solution, and results fields.", status="todo", order=6, assignee_id=maya.id, created_at=now - datetime.timedelta(days=3)),
        Task(project_id=website_redesign.id, title="Implement contact form with validation", description="Build server-side validated form with honeypot spam protection and email notification on submission.", status="todo", order=7, assignee_id=james.id, created_at=now - datetime.timedelta(days=2)),
        Task(project_id=website_redesign.id, title="Performance audit and optimization", description="Run Lighthouse audit, optimize images, implement lazy loading, and reach 90+ scores on all metrics.", status="todo", order=8, assignee_id=None, created_at=now - datetime.timedelta(days=1)),
        Task(project_id=website_redesign.id, title="Write launch blog post and social assets", description="Draft announcement post, prepare social media graphics, and schedule posts for launch day.", status="todo", order=9, assignee_id=maya.id, created_at=now),
    ]

    # ── Tasks for Mobile App v2 ──────────────────────────────────
    ma_tasks = [
        Task(project_id=mobile_app.id, title="Define offline-first architecture", description="Design data sync strategy: local SQLite store, conflict resolution, and background sync queue.", status="done", order=1, assignee_id=sofia.id, created_at=now - datetime.timedelta(days=13)),
        Task(project_id=mobile_app.id, title="Design dark theme color tokens", description="Create dark mode equivalents for all UI elements, ensure WCAG AA contrast across both themes.", status="done", order=2, assignee_id=maya.id, created_at=now - datetime.timedelta(days=11)),
        Task(project_id=mobile_app.id, title="Implement push notification channels", description="Set up Firebase Cloud Messaging with topic-based channels for marketing, transactional, and alert notifications.", status="in_progress", order=3, assignee_id=sofia.id, created_at=now - datetime.timedelta(days=8)),
        Task(project_id=mobile_app.id, title="Build new onboarding flow", description="Design and implement 4-screen onboarding with permissions priming and value proposition highlights.", status="in_progress", order=4, assignee_id=maya.id, created_at=now - datetime.timedelta(days=6)),
        Task(project_id=mobile_app.id, title="Implement biometric authentication", description="Add FaceID and fingerprint login option with secure token storage in the keychain.", status="todo", order=5, assignee_id=sofia.id, created_at=now - datetime.timedelta(days=4)),
        Task(project_id=mobile_app.id, title="Create widget for home screen", description="Build iOS and Android home screen widgets showing today's tasks and upcoming deadlines.", status="todo", order=6, assignee_id=None, created_at=now - datetime.timedelta(days=2)),
        Task(project_id=mobile_app.id, title="Accessibility audit and remediation", description="Test with VoiceOver and TalkBack, fix all critical issues, add semantic labels throughout.", status="todo", order=7, assignee_id=maya.id, created_at=now - datetime.timedelta(days=1)),
    ]

    # ── Tasks for API Platform Upgrade ───────────────────────────
    api_tasks = [
        Task(project_id=api_platform.id, title="Design GraphQL schema for v2", description="Map all existing REST endpoints to GraphQL types, queries, and mutations. Document breaking changes.", status="done", order=1, assignee_id=james.id, created_at=now - datetime.timedelta(days=6)),
        Task(project_id=api_platform.id, title="Implement rate limiting middleware", description="Add token-bucket rate limiter with per-client and per-endpoint tiers, configurable via admin dashboard.", status="in_progress", order=2, assignee_id=sofia.id, created_at=now - datetime.timedelta(days=4)),
        Task(project_id=api_platform.id, title="Write Python SDK", description="Build idiomatic Python client library with async support, type hints, and comprehensive docstrings.", status="in_progress", order=3, assignee_id=james.id, created_at=now - datetime.timedelta(days=3)),
        Task(project_id=api_platform.id, title="Write JavaScript SDK", description="Build TypeScript-first JS client with tree-shakeable modules, middleware support, and UMD/CJS/ESM builds.", status="todo", order=4, assignee_id=sofia.id, created_at=now - datetime.timedelta(days=2)),
        Task(project_id=api_platform.id, title="Build interactive API documentation portal", description="Create developer portal with GraphQL playground, code snippets in 5 languages, and changelog feed.", status="todo", order=5, assignee_id=None, created_at=now - datetime.timedelta(days=1)),
        Task(project_id=api_platform.id, title="Set up API monitoring and alerting", description="Configure Datadog dashboards for latency, error rate, and throughput. Set up PagerDuty alerts for anomalies.", status="todo", order=6, assignee_id=james.id, created_at=now),
    ]

    db.add_all(wr_tasks + ma_tasks + api_tasks)
    await db.commit()

    print("✓ Seeded demo data: 5 users, 3 projects, 22 tasks")

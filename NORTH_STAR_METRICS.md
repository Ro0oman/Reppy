# North Star Metrics Tracking (Sprint 6)

## 1) Goal
Measure if activation redesigns improve real retention.

Primary outcomes:
- Activation (first value moment)
- D1 retention
- D7 retention
- D30 retention

## 2) Event Naming Standard

Naming rules:
- `domain.object.action`
- English, snake_case tokens, stable over time.
- Never include UI wording in event names.

Core events:
- `activation.first_rep_logged`
- `activation.daily_mission_completed`
- `retention.return_24h`
- `retention.return_7d`
- `retention.return_30d`

Recommended support events:
- `activation.quickstart_seen`
- `activation.quickstart_completed`
- `activation.today_block_cta_clicked`

## 3) Event Contract

Required properties for every event:
- `user_id` (string|number)
- `event_name` (string)
- `event_time` (ISO-8601 UTC)
- `platform` (`web_mobile`, `web_desktop`)
- `locale` (`es`, `en`, etc.)
- `app_version` (git SHA or release id)

Attribution properties for experiments:
- `experiment_id` (nullable string)
- `variant_id` (nullable string)

Recommended context properties:
- `session_id`
- `route_name`
- `streak_days`
- `reps_today`

## 4) Metric Definitions

Activation:
- Numerator: users that fire `activation.first_rep_logged` within 24h from signup.
- Denominator: new users created in the same cohort.

D1 retention:
- User has an app event in `[signup+24h, signup+48h)`.

D7 retention:
- User has an app event in `[signup+7d, signup+8d)`.

D30 retention:
- User has an app event in `[signup+30d, signup+31d)`.

Mission completion rate:
- Users with `activation.daily_mission_completed` / users with at least one rep that day.

## 5) Technical Tracking Guide

Recommended payload shape:

```json
{
  "event_name": "activation.first_rep_logged",
  "event_time": "2026-05-01T12:00:00Z",
  "user_id": 123,
  "platform": "web_mobile",
  "locale": "es",
  "app_version": "d40dee0",
  "experiment_id": "activation_sprint6_onboarding",
  "variant_id": "v2"
}
```

Implementation notes:
- Fire events server-side when possible for reliability.
- Keep a dedupe key for idempotency:
  - `user_id + event_name + calendar_day_utc` for daily events.
  - `user_id + event_name` for one-time events (`first_rep_logged`).
- Keep event schema backward compatible; add new properties without renaming old keys.

## 6) QA Checklist

Event integrity:
- [ ] `activation.first_rep_logged` fires once per user lifetime.
- [ ] `activation.daily_mission_completed` fires when daily mission reaches completed state.
- [ ] `retention.return_24h` only fires after the user has crossed 24h since signup.
- [ ] `retention.return_7d` only fires after 7 full days.
- [ ] `retention.return_30d` only fires after 30 full days.

Data quality:
- [ ] `event_time` is UTC and valid ISO-8601.
- [ ] `user_id` is always present for authenticated users.
- [ ] `platform` is populated correctly on mobile vs desktop viewport.
- [ ] `locale` matches active app locale.
- [ ] `app_version` is present and non-empty.

Product readout readiness:
- [ ] Daily dashboard includes Activation, D1, D7, D30.
- [ ] Metric definitions used in dashboard match Section 4 exactly.
- [ ] Experiment fields (`experiment_id`, `variant_id`) are visible in raw events.

## 7) Decision Guide

Use this to evaluate Sprint 6:
- If Activation improves but D1 does not, onboarding improves first action but not habit loop.
- If D1 improves but D7/D30 do not, improve week-1 incentives (missions, streak, social loops).
- If D7 and D30 improve, keep variant and expand to broader cohorts.


# Reflections

## Working with APIs

Building this project gave me a much more concrete sense of what "working with an API" actually involves beyond just calling `fetch()`. The NASA APOD endpoint takes `start_date` and `end_date` query parameters, so most of the real work was in shaping the request correctly (defaulting to a 9-day window, validating that the start date isn't after the end date, respecting the API's earliest available date of 1995-06-16) and then shaping the response for the UI. The APOD response isn't totally uniform — most days are `media_type: "image"`, but some are `media_type: "video"` with a completely different payload (no `hdurl`, sometimes no thumbnail), so I had to branch my rendering logic based on that field instead of assuming every entry looks the same. That's a good reminder that an API's documented schema is really a union of shapes, not one shape, and your code needs to handle the variants explicitly rather than hoping they don't show up. I also used `async/await` with `try/catch` around the fetch call so that a failed request (bad key, network error, rate limit) shows a readable error message instead of silently breaking the gallery.

## Debugging

The most interesting debugging moment in this project wasn't actually in my own code — it was figuring out that NASA's live APOD API is currently degraded. While testing, every date I queried (recent dates, dates from 2024, dates from 2023) came back with an HTTP 200 and a syntactically valid JSON object, but the `title`, `url`, and `hdurl` fields were all identical generic "NASA Science" placeholder values, while the `explanation` field still contained real, date-specific text. At first this looked like a bug in my fetch logic or my rendering code, since the gallery was displaying "correctly" from a code standpoint but showing the same image nine times. The debugging process was: (1) reproduce the issue outside the app with a plain `curl` request to rule out anything client-side, (2) vary the query parameters (different single dates, the no-date "today" request, which actually returned a 500) to see if the problem was request-specific or global, and (3) check response headers to confirm it was hitting NASA's real infrastructure and not a caching layer on my end. That process confirmed the issue was entirely upstream. It was a useful lesson in not assuming a bug is yours just because the symptom shows up in your UI — tracing the data back to its source (in this case with `curl`, independent of the browser or my JS) isolated the problem and saved me from chasing a phantom bug in code that was actually working correctly.

## LinkedIn Post

🚀 Just shipped my NASA Space Explorer app! Using NASA's Astronomy Picture of the Day API, you can pick any date range and browse 9 days of space imagery — nebulae, galaxies, planets, even the occasional video — in a modal view with the full title, date, and explanation written by NASA astronomers.

A few things I'm proud of:
- Built the whole data flow with async/await: fetch → validate → render → handle errors gracefully
- Added a dynamic modal window with full image/video + description
- Styled the whole thing to match NASA's actual brand colors and typography
- Handled video entries from the API (not just images) so nothing in the gallery breaks

Fun bonus: while testing, I discovered NASA's live API is currently serving placeholder data for most historical dates — a good reminder that even production-grade government APIs have outages, and that solid error handling and debugging instincts matter as much as the happy path.

#WebDevelopment #JavaScript #API #NASA #100DaysOfCode

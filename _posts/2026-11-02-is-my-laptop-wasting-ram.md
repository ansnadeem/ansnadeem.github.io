---
layout: post
title: I checked whether my laptop is wasting RAM
description: Three months of running my own models on a MacBook, what it cost, and what it would cost on OpenRouter.
charts: /assets/charts/local-models.js
---

A few days ago Sam Altman was on Stripe's Cheeky Pint podcast talking about the memory shortage. On people running models locally he said:

> It's quite terrible to have everybody have a bunch of the world's limited supply of DRAM sitting in their own computer. And be used 5% of the time.<sup><a href="#source-1">1</a></sup><sup><a href="#source-2">2</a></sup>

His point is that memory in a data center is busy all day while memory in your laptop mostly sits there. Futurism put it more bluntly and said he hates the idea of people running AI models at home.<sup><a href="#source-3">3</a></sup>

I've been running models on my own machine for a few months now so I wanted to see what my numbers actually look like.

## My setup

I use a MacBook Pro with an M5 Pro and 64 GB of memory. Nothing else, no GPU box or home server.

Most of the time I run Qwen3.8 27B in 4-bit. I've also used Gemma 4 and a smaller 9B Qwen for quick tests.

I even use them to power a few projects hosted in the cloud. I just run a quick cloudflared tunnel using [mlxsh](https://github.com/ansnadeem/mlxsh), a simple and stupid script I wrote that serves MLX models behind an OpenAI compatible endpoint.

## What I've used so far

Between August 1 and October 23 I sent about 10.6 million tokens in and got 391 thousand back. Most of that went to Qwen3.8 27B. The GPU was busy for about 15 hours in total.

<div class="stats">
  <div><span class="stat-value">$5.03</span><span class="stat-label">on OpenRouter</span></div>
  <div><span class="stat-value">$0.12</span><span class="stat-label">in electricity</span></div>
  <div><span class="stat-value">15 h</span><span class="stat-label">of GPU time</span></div>
</div>

On OpenRouter the same usage would have cost around $5 with one of the regular providers. Running it myself cost around 12 cents in electricity.

<figure class="chart" id="chart-daily" aria-label="Tokens per day by model, August 1 to October 23">
  <figcaption>Tokens per day, prompt and output together</figcaption>
  <div class="chart-legend"></div>
  <div class="chart-plot"></div>
</figure>

More than half of it happened on two days in October, when I kept running the same long prompts over and over.

## Scaling it up

At my usage the difference doesn't really matter, so I took my October usage, spread it over a year and scaled it up from there.

<figure class="chart" id="chart-cost" aria-label="Yearly cost on OpenRouter compared with my cost at three usage levels">
  <figcaption>Cost per year, OpenRouter against my cost</figcaption>
  <div class="chart-legend"></div>
  <div class="chart-plot"></div>
  <p class="chart-note">My cost is the electricity the laptop uses while it's running the model.</p>
</figure>

Per token running it locally is about 40 times cheaper and that holds as usage goes up. If I kept the laptop busy all day the savings would pay for it in about a year.

## Why I still do it

I don't think saving money is the main reason to do this, although I do love not paying for my doomed hobby projects. $5 against 12 cents is nothing either way. The reasons I keep doing it are different. Whatever I send the model stays on my machine. When I'm testing with my own data I'd rather it didn't go anywhere else.

I've seen that a smaller model shows you where your code is weak. Big hosted models cover up a lot of bad prompting and a 4-bit 27B model doesn't. It caught a handful of bugs in my own code that a bigger model would have quietly worked around. Perhaps that's a double edged sword.

The downside is speed. The 27B model writes around 17 tokens a second and a long prompt can take 40 seconds before anything comes back. I'm fine with that while I'm building something and not exactly sure what I'm building.


## Where he has a point

I'm all for local inference, and this might be subjective based on who you are. But he is right about the idle part. He guessed 5% and mine was worse. 15 hours out of almost three months is less than 1% of the time, and the rest of the time my memory isn't doing any AI work.


\- Ans

<p class="notes">How I counted: token numbers include requests that failed partway. OpenRouter prices are from November 2026, using Alibaba's rate for Qwen3.8 27B and Cloudflare's for Gemma 4.<sup><a href="#source-4">4</a></sup><sup><a href="#source-5">5</a></sup> Speed is from a benchmark ran on my machine. Electricity assumes about 60 W while generating at 13 cents per kWh, which is about the average residential rate here in Utah.<sup><a href="#source-6">6</a></sup> Yearly figures are my October usage times twelve.</p>

<ol class="notes sources">
  <li id="source-1">Michael Kan, <a href="https://tech.yahoo.com/ai/chatgpt/articles/sam-altman-suggests-running-ai-173334065.html">Sam Altman Suggests Running AI Locally Is a Waste of Memory</a>, PCMag, October 30, 2026.</li>
  <li id="source-2"><a href="https://frvr.com/blog/news/openai-ceo-sam-altman-says-its-terrible-to-have-everybody-have-a-bunch-of-the-worlds-limited-supply-of-dram-instead-of-shoving-it-all-in-datacentres/">OpenAI CEO Sam Altman says it's terrible to have everybody have a bunch of the world's limited supply of DRAM</a>, FRVR, October 30, 2026.</li>
  <li id="source-3"><a href="https://futurism.com/artificial-intelligence/sam-altman-hates-local-ai-models-computers">Sam Altman Absolutely Hates the Idea of People Running Their Own AI Models at Home</a>, Futurism.</li>
  <li id="source-4"><a href="https://openrouter.ai/qwen/qwen3.8-27b">Qwen3.8 27B providers and pricing</a>, OpenRouter.</li>
  <li id="source-5"><a href="https://openrouter.ai/google/gemma-4-26b-a4b-it">Gemma 4 26B A4B providers and pricing</a>, OpenRouter.</li>
  <li id="source-6"><a href="https://www.voltflow.net/electricity-cost-calculator/state/utah">Utah residential electricity rates</a>, Voltflow, from EIA data.</li>
</ol>

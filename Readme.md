# Hyper Automata Cellular Kernel Universe System

A browser-based cellular automata simulator inspired by Conway’s Game of Life, extended with additional cell types and behavioral rules to explore how different strategies affect population growth, collapse, and long-term dynamics.

## Introduction

I recently read about Conway’s Game of Life and found it fascinating. I decided to build a simulator to experiment with it myself.

Very quickly, I noticed that the simulation often converges into stable, repeating, and highly harmonized patterns. While this is elegant, it also made me wonder whether a more dynamic model could be created — one that feels closer to a living system, or at least one in which different behavioral patterns can be tested.

That idea led to the creation of **Hyper Automata Cellular Kernel Universe System**.

This project starts from the same foundation as Conway’s Game of Life, but extends it with additional cell types and behaviors.

## Purpose

The main goal of this project is to observe how a population evolves when certain behaviors become dominant.

I am interested not only in whether the system converges to a stable state, as in Conway’s original model, but also in when the system stops proliferating.

Since a cell dies when it has more than three neighbors, I initially expected that a more expansive behavior — one that promotes cell generation — would cause the system to collapse faster.

However, my experiments suggested the opposite:

- a **modest behavior** (no active proliferation) tends to lead to collapse
- a **greedy behavior** (active proliferation) tends to keep the system alive indefinitely

So far, I have not recorded a full system stop caused by expansive behavior.

## What This Project Contains

This repository includes both simulators:

- **Conway’s Game of Life** — the original baseline model
- **Hyper Automata Cellular Kernel Universe System** — the extended model with multiple cell types and custom behaviors

You can choose either simulation and observe how the system behaves under different rules.

## Core Idea

This project explores a simple but interesting question:

**How much can a system change when its agents are no longer identical?**

By introducing different behaviors into a familiar cellular automaton, the simulation becomes a way to test how growth, restraint, and expansion influence the overall survival of the system.

## Features

- Classic Conway’s Game of Life mode
- Extended simulation mode with additional cell types
- Custom behavioral rules
- Interactive browser-based interface
- Real-time visual feedback
- Adjustable parameters for experimentation

## 🚀 Live Demo

[Open Simulation](https://hackus.github.io/game-of-life/)
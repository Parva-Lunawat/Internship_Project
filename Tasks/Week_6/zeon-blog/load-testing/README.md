# Load Testing

## Purpose
This workspace contains local scenario runners for measuring blog and comment flows.

## What Lives Here
- Scenario files for public reads, detail reads, login bursts, write bursts, upload bursts, comment creation, comment listing, and mixed traffic.
- Shared helpers for network calls, scenario timing, and summary statistics.
- A runner that executes the scenario set and writes benchmark summaries to the results directory.

## Navigation
- Add new traffic models as focused scenario files.
- Reuse shared helpers instead of duplicating request and statistics logic.
- Store generated benchmark summaries in the results directory.

## Safe Usage Notes
Runtime targets and private access material should be supplied locally and never committed to markdown. Reports should summarize methods and outcomes without concrete hosts or account values.
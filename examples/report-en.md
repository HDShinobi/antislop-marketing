# Example: performance report, English, tier R

## Before

```
In today's fast-paced world, our cutting-edge approach plays a crucial role in
driving results. The campaign performed strongly and delivered comprehensive
improvements across the board.
```

## After

```
CPA came in at 31 against a 35 target. ROAS was 3.4 against 2.8.

Search carried 12,400 of the spend at a 31 CPA. Meta carried 8,100 at 47.

The gap is not a targeting problem. Meta's creative set has not changed since
April, and frequency passed 4.0 in the second week.
```

## What fires

| Rule | Caught |
|---|---|
| `EN-BANLIST` | `In today's fast-paced world`, `plays a crucial role in` |
| `EN-PUFFERY` | `cutting-edge`, `comprehensive` |
| `EN-EVAL-CANDIDATE` | `strongly` |
| `EVID-UNBACKED` | `strongly`, `comprehensive`; nothing supports either |

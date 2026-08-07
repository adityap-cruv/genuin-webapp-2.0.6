# IO v1 vs IO v2 disagreement — fleet run 2026-08-07

Output of the disagreement-rate query (see [VISIBILITY_DIAGNOSTIC_QUERYING.md]) over one day of
`visibility_diagnostic`, non-`forced_fill`, Android + iOS. Analysis in
[VISIBILITY_DIAGNOSTIC_FINDINGS.md §5](../VISIBILITY_DIAGNOSTIC_FINDINGS.md). Full result is ~600 rows
with a long count≈1 tail; the high-signal head is reproduced here (rows with ≥100 events).

`disagree_pct` = `io_v1_intersecting AND NOT io_v2_is_visible` / events.
`offscreen_rect` uses `rect_x<0 OR rect_y<0` — **over-counts** (a 1px scroll trips it); a rough
corroborator only. `zero_inner_vp` = `viewport_inner_width=0 OR viewport_inner_height=0`.

## Android (io_v2_supported = 1) — IO v2 disagrees, per-app 11%→99%

| app                               | events | visits | v1_yes_v2_no | disagree_pct | zero_inner_vp | offscreen_rect |
| --------------------------------- | -----: | -----: | -----------: | -----------: | ------------: | -------------: |
| com.Beauchamp.Messenger.external  |   4852 |   4746 |         2260 |         46.6 |          2531 |           3733 |
| com.scatterlab.messenger          |   3005 |   2942 |         1449 |         48.2 |          2205 |           2753 |
| 281940292 (android)               |   2221 |   2070 |         1721 |         77.5 |           708 |           1392 |
| net.uploss.water_app              |   1965 |   1958 |         1940 |         98.7 |          1083 |           1831 |
| droom.sleepIfUCan                 |   1559 |   1527 |         1442 |         92.5 |           138 |           1140 |
| net.uploss.affirmation            |   1257 |   1257 |         1242 |         98.8 |          1091 |           1225 |
| com.animax.max                    |   1093 |   1077 |         1047 |         95.8 |           923 |           1060 |
| com.dubox.drive                   |    541 |    467 |          538 |         99.4 |           537 |            538 |
| com.adfone.aditup                 |    509 |    485 |          498 |         97.8 |           359 |            493 |
| com.callapp.contacts (78ab)       |    476 |    428 |          251 |         52.7 |           451 |            459 |
| net.uploss.bible                  |    457 |    457 |          452 |         98.9 |           311 |            434 |
| com.Project100Pi.themusicplayer   |    316 |    200 |           35 |         11.1 |           303 |            307 |
| com.americasbestpics              |    287 |    284 |          157 |         54.7 |           123 |            207 |
| com.uploss.health.fasting         |    168 |    166 |          159 |         94.6 |           116 |            154 |
| com.diy.perfect.asmr              |    162 |    137 |           31 |         19.1 |            23 |             78 |
| com.handcent.app.nextsms          |    149 |    149 |           25 |         16.8 |           113 |            135 |
| jp.co.goodroid.hyper.hexaaway     |    128 |    117 |          115 |         89.8 |             5 |             81 |
| com.taggedapp                     |    126 |    123 |           96 |         76.2 |            76 |            102 |
| net.happywit.yarn.out.jam         |    124 |    120 |          111 |         89.5 |            10 |             69 |
| pro.novel.fiction.read.story.book |    120 |    116 |           14 |         11.7 |           103 |            109 |
| com.arrow.out                     |    114 |    109 |          106 |         93.0 |             8 |             54 |
| com.sciplay.dancingdrumsslots     |    108 |    107 |           30 |         27.8 |            77 |             93 |
| com.abi.colony.flow               |    108 |    108 |          102 |         94.4 |             6 |             80 |
| neverending.ai.challenge…         |    104 |    101 |           16 |         15.4 |            88 |             96 |
| com.screw3d.match.nuts.bolts…     |    104 |    102 |           82 |         78.8 |            21 |             60 |

## iOS (io_v2_supported = 0) — no IO v2; geometry is the only signal

`v1_yes_v2_no` / `disagree_pct` are structurally 0 (IO v2 can't answer). Read `offscreen_rect` /
`zero_inner_vp` instead — heavily hidden apps vs genuinely healthy ones both appear.

| app (iOS store id) | events | visits | zero_inner_vp | offscreen_rect | note                               |
| ------------------ | -----: | -----: | ------------: | -------------: | ---------------------------------- |
| 281940292          |  14665 |  14352 |             0 |             87 | genuinely healthy (low offscreen)  |
| 1544750895         |   8330 |   8256 |          7176 |           8325 | nearly all impressions off-screen  |
| 6504324020         |   2659 |   2622 |             4 |           2658 | off-screen (rect), inner-vp intact |
| 6748950306         |   2303 |   2283 |             0 |           2299 | off-screen                         |
| 6761760135         |   1704 |   1699 |             1 |           1702 | off-screen                         |
| 6740043080         |   1669 |   1639 |             3 |           1667 | off-screen                         |
| 389157776          |   1478 |   1435 |             0 |           1409 | off-screen                         |
| 6756185760         |   1443 |   1434 |             1 |           1438 | off-screen                         |
| 6749456493         |   1173 |   1169 |             1 |           1168 | off-screen                         |

> The iOS `offscreen_rect` counts are inflated by the `rect < 0` over-count (see findings §5). Re-run
> with the area-majority rule for the true iOS hidden rate.

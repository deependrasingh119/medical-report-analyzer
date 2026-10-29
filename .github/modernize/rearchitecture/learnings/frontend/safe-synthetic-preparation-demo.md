# Safe Synthetic Preparation Demo

Use a fixed synthetic API fixture and predefined question controls for a patient preparation summary; never accept report content or free text in a demo.

## What Happened

CareLens task `t6` connected the patient page to one bodyless GET fixture and let users select only fixed clinician discussion prompts. The generated list stayed in component state, with visible no-save/no-send and clinician-review notices. No file picker or text entry was added.
_Discovered in CareLens during task `t6` when the assigned report-preparation scope had a stricter no-input privacy boundary than the earlier static prototype._

## Takeaway

Keep demo patient input as fixed, typed choices and build summaries only from those choices. Validate the expected synthetic fixture identity/labels, make the API request bodyless, and do not persist or transmit user selections. Preserve existing source prototype files when their behavior conflicts with the approved privacy boundary.

## History

- 2026-10-29 (CareLens/t6): initial

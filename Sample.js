Alright, I get the context now 👍
Let me explain this cleanly, in tester-friendly language, mapping TC05 / TC06 → business flow → DB validation → why those queries are asked.
1️⃣ First, the business concept (very important)
Sub-accounts types
Retail account → Normal standalone account
AS account (Advisor Service) →
Created when a retail sub-account is linked to a master account
AS is a bundled offer
Linking = enrolls AS offer
Unlinking = removes AS offer
So:
Retail → AS = Link sub-account to master
AS → Retail = Unlink sub-account from master
2️⃣ What are these test cases actually testing?
🔹 TC05 – Account moved from AS → Retail
Meaning:
The sub-account was earlier linked to a master
AS bundled offer was active
Now the master is unlinked
AS offer should be terminated
Account becomes Retail
Purpose (Fee waiver focus):
Verify fee waiver observations are correctly:
End-dated / removed
No AS fee benefits continue
Data setup = ensure the right offer & elements are closed
👉 Example from your message:
Copy code

10000091 – Account moved from AS to Retail
🔹 TC06 – Account moved from Retail → AS
Meaning:
The sub-account was Retail
Now linked to a master account
AS bundled offer is enrolled
Account becomes AS
Purpose (Fee waiver focus):
Verify fee waiver observations are:
Newly created
Active from enrollment date
Data setup = ensure AS offer & elements are created
👉 Example from your message:
Copy code

10020178 – Account moved from Retail to AS
3️⃣ Why your TL explained “subaccounts, master, AS”
Because both test cases are NOT new account creation.
They are state transitions:
Scenario
Action
Offer impact
Retail → AS
Link to master
AS offer added
AS → Retail
Unlink master
AS offer removed
4️⃣ Why they asked you to take ORD_ITEM + ITE / ETG screenshots
Because offers and fee waivers are stored at order & element level.
They want proof that:
Correct offer is enrolled / terminated
Correct elements (fee waiver components) are active or end-dated
5️⃣ Explanation of the FIRST query (ORD_ITEM – offer level)
Sql
Copy code
select 
  o.OFFER_ORDER_ID,
  o.OFFER_ID,
  o.OFR_TRGT_ID,
  p.OFFER_NM,
  o.OFR_ORD_STAT_CD,
  o.AUDIT_UPDT_USER_ID,
  o.AUDIT_UPDT_TS,
  o.AUDIT_ADD_INTER_ID,
  o.AUDIT_UPDT_INTER_ID
from ORD_ITEM o, PNTRY_OFFER p
where o.OFFER_ID = p.OFFER_ID
and o.OFR_TRGT_ID in (10000091, 10020178)
and o.OFFER_ID > 1200000
and o.OFR_ORD_STAT_CD = 'ACTIVE'
What this checks:
Which offer the account is enrolled in
Offer status (ACTIVE / INACTIVE)
Confirms whether:
AS offer is present (TC06)
AS offer is removed (TC05)
📌 Expected:
TC05 (AS → Retail) → AS offer should NOT be active
TC06 (Retail → AS) → AS offer should be ACTIVE
6️⃣ Second query – ORD_ITEM_ELT (element level)
Sql
Copy code
select 
  A.OFFER_ORDER_ID,
  A.OFFER_ID,
  A.OFR_TRGT_ID,
  A.OFR_ORD_STAT_CD,
  B.ELEMENT_ID,
  B.ORD_ELT_EXPR_DT,
  B.ORD_ELT_STAT_CD
from ORD_ITEM A, ORD_ITEM_ELT B
where A.OFFER_ORDER_ID = B.OFFER_ORDER_ID
and B.ELEMENT_ID in (7978, 9977, 8001, 8009, 8065, 8061, 8063)
and A.OFR_TRGT_ID in (....)
and A.OFR_ORD_STAT_CD = 'ACTIVE'
What are these ELEMENT_IDs?
These are fee waiver / benefit elements inside the AS bundle.
This query checks:
Which fee waiver elements are attached
Their status
Their expiry dates
📌 Expected:
TC05 → Elements should be terminated / end-dated
TC06 → Elements should be ACTIVE
7️⃣ Third query – ORD_ELT_TRGT (element target mapping)
Sql
Copy code
select 
  A.OFFER_ORDER_ID,
  A.OFFER_ID,
  A.OFR_TRGT_ID,
  A.OFR_ORD_STAT_CD,
  B.ELEMENT_ID,
  B.ELT_TRGT_STAT_CD
from ORD_ITEM A, ORD_ELT_TRGT B
where A.OFFER_ORDER_ID = B.OFFER_ORDER_ID
and B.ELEMENT_ID in (7978,9977,8001,8009,8065,8061,8063)
and A.OFR_TRGT_ID in (....)
and A.OFR_ORD_STAT_CD = 'ACTIVE'
What this validates:
Whether the element is effectively applied to the account
Final confirmation of fee waiver eligibility
8️⃣ How to summarize these test cases (for interview / status / doc)
TC05 – AS → Retail
Unlink master account
AS bundled offer terminated
Fee waiver elements removed
Validate via ORD_ITEM, ORD_ITEM_ELT, ORD_ELT_TRGT
TC06 – Retail → AS
Link sub-account to master
AS bundled offer enrolled
Fee waiver elements activated
Validate via ORD_ITEM, ORD_ITEM_ELT, ORD_ELT_TRGT
If you want, I can next:


























✅ Convert this into test case steps
✅ Write expected results
✅ Help you reply back to the group with a clean technical explanation
✅ Map which element ID = which fee waiver












Purpose
As part of the Retail Segmentation project, 02 is implementing RabbitMQ bindings for CST/Salesforce integration to enable automated event publishing when batch enrollments are completed for SPWS Family Benefits at both client level (Offer 1419) and account level (Offer 1418).
This change allows CST/Salesforce to consume RabbitMQ events triggered after BAU batch processing enrolls associated clients and accounts based on household (HH) level enrollments received from CAT segmentation view file.
Classification
Schwab Interrial
Out of Scope
NA
Acceptance Criteria
RabbitMQ bindings for CST/Salesforce are successfully deployed to production for SPWS Family Benefits events.
Queue cit-salesforce is created and configured with the required bindings:
02-preference-action.activated.srn.express.experience.spwsFbClient
02-preference-action.cancelled.srn.express.experience.spwsFbClient
02-preference-action.activated.srn.express.experience.spwsFbAcct
02-preference-action.cancelled.srn.express.experience.spwsFbAcct
RabbitMQ events are successfully published to CST/Salesforce upon completion of batch enrollments for:
Client-level SPWS Family Benefits (Offer 1419)
Account-level SPWS Family Benefits (Offer 1418)
BAU job processes household enrollments from CAT segmentation view file and enrolls associated clients and accounts to SPWS Family Benefits offers.
CST/Salesforce successfully consumes RabbitMQ events after batch enrollments are completed at both client and account levels.
Exception cases (less than 100 households) requiring account and customer uptiering are successfully handled without impacting event publishing.
















































const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/database.json');
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Create a backup
const backupPath = dbPath + '.bak.' + Date.now();
fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Created backup at:', backupPath);

const septNote = db.notes.find(n => n.id === 'daily_text_2026_Septiembre');
if (!septNote) {
  console.error('Note daily_text_2026_Septiembre not found in database!');
  process.exit(1);
}

const newDaysContent = `# 🌅 Daily Text Comments — Septiembre 2026

---
## 📅 DÍA 1 • Keep Testing Whether You Are in the Faith (2 Cor. 13:5-6)

# Keep Testing Whether You Are in the Faith — 1 de Septiembre de 2026

> 📖 "Keep testing whether you are in the faith. Keep proving what you yourselves are." — 2 Corintios 13:5-6

### Overview
- Meeting centered on **2 Corinthians 13:5-6**: *"Keep testing whether you are in the faith. Keep proving what you yourselves are."*
- Multiple speakers from different locations gave comments, followed by an extended main talk and Watchtower study reading.

### Comments — Illustrations on Self-Examination
- **Brother Brendan Frisbee (Fishkill):** Used a **vehicle alignment** analogy — just as a car's alignment can drift from bumps and rough roads, spiritual thinking can gradually shift due to challenges and worldly distractions; regular self-examination (like a mechanic's correction) is essential.
- **Sister Karina Sukhoseva (ASL Translation Office, Fort Lauderdale):** Used a **vision test** analogy — honest self-assessment, like being honest with an eye doctor, allows Jehovah to help correct weaknesses and improve one's life.
- **Sister Leslie Bogersi (Fishkill):** Addressed **perfectionism** as a barrier to self-examination — fear of failure can cause one to avoid searching questions; Jehovah is not looking to condemn but to identify good qualities and areas for growth; *"we are valuable specks of dust."*
- **Brother Keenan Flaugherzi:** Used a **water treatment plant** analogy — continuous testing is done not just to measure, but to adjust and prevent harm; outlined three steps:
  1. Test with searching questions.
  2. Analyze any weakness found.
  3. Seek Jehovah's help through prayer and practical steps.

### Main Talk — Staying Spiritually Balanced
- Paul's words warn that one could *"fail the test"* and become disapproved for everlasting life; the call is to stay alert and realign with Jehovah's thinking if veering off course.
- Even those with significant spiritual responsibilities can fall away; conviction can fluctuate, as illustrated by Paul's confidence in **Romans 8:38-39** versus moments of internal struggle.
- **Asaph's example (Psalm 73):** A highly respected man who nearly strayed after becoming envious of wealthy, arrogant people; his thinking became distorted and he felt his service was in vain.
  - *What helped Asaph:* He returned to Jehovah's sanctuary, surrounded himself with Jehovah's people, and reflected on the future of those who despised God — this reset his thinking and restored his joy.
  - Psalm 73 is recommended as a resource for anyone feeling spiritually unbalanced or discouraged.
- **Deuteronomy 12:5 used as a key:** Jehovah told his people to seek wherever He *"chooses to establish his name"* as the identifying mark of true worship.
  - Only one group on earth loves and uses the name Jehovah proudly; **Psalm 91:14** and **Hebrews 6:10** affirm that Jehovah values and remembers those who know and love his name.
  - This is presented as evidence that the congregation has found the truth and every reason to remain faithful.

### Watchtower Study — Read by Brother Nate Gutierrez
- Spiritual maturity must be actively maintained, not assumed; overconfidence is a risk.
- Paul's letter to the Colossians warned against worldly thinking even for established Christians; Epaphras prayed that they would *"stand complete and mature"* — highlighting that maturity requires both personal effort and God's support.

---
## 📅 DÍA 2 • Wednesday Morning Worship: "Do Not Fear Them" (Numbers 14:9)

# Wednesday Morning Worship — Numbers 14:9, "Do Not Fear Them" — 2 de Septiembre de 2026

> 📖 "Jehovah is with us. Do not fear them." — Números 14:9

### Overview
- **Daily text:** Numbers 14:9 — *"Jehovah is with us. Do not fear them."*
- Meeting held on Wednesday, September 2nd at a branch; comments delivered by branch students.
- **Central theme:** Overcoming fear of man through fear of (reverence for) Jehovah.

### Commenter: Simon Susana — "Do Not Fear"
- Cross-referenced **Deuteronomy 20:3**: *"Do not let your hearts be timid."*
- Used Jeremiah as an example: timid by nature but courageous through trust in Jehovah.
- **Key point:** Jehovah understands human fear and helps us overcome feelings of inadequacy.
- Joshua and Caleb also faced fear (e.g., in Rahab's house) but were confident because Jehovah was with them.

### Commenter: Markus Waranen — Remembering Jehovah's Support
- Drew on the account of Elisha's servant surrounded by the Syrian army: *"There are more who are with us than those who are with them."*
- Jehovah revealed heavenly forces ready to help, illustrating unseen angelic support.
- **Practical application:** When fear of others' reactions hinders witnessing, visualizing angelic support can give courage to share the good news.

### Commenter: Olivier Valmenos — Building a Personal History with Jehovah
- Joshua and Caleb's confidence was rooted in past experiences of Jehovah's help.
- Reflecting on what Jehovah has done previously strengthens confidence for future challenges.
- **Key insight:** What matters is not the size of an obstacle, but the strength of one's confidence in Jehovah.
- Staying close to Jehovah and following his direction gives every reason to be courageous.

### Commenter: Frank Rurik — Clean Conscience and Approaching Jehovah
- Drew a connection between fearlessness and realizing Jehovah is near.
- *Illustration:* A helpful neighbor becomes difficult to approach after a falling-out — similarly, a troubled conscience hinders free approach to Jehovah in prayer.
- A clean conscience enables confident, uninhibited prayer, reassuring us that Jehovah is near and ready to help.

### Extended Teaching — Fear of God vs. Fear of Man
- **Psalm 118:6:** *"Jehovah is on my side, I will not be afraid. What can man do to me?"* — fear of God conquers fear of man.
- **Key scriptures examined on the fear of Jehovah:**
  - *Deuteronomy 10:12:* Fear of Jehovah is inseparable from loving and serving him wholeheartedly.
  - *Psalm 147:11:* Fear and love are not opposites but coexisting qualities that bring Jehovah's approval.
  - *Ecclesiastes 12:13:* Fearing God and keeping his commandments is "the whole obligation of man."
  - *Proverbs 9:10:* "The fear of Jehovah is the beginning of wisdom" — it must be the starting point for handling any problem.
- **Fear of man as a snare (Proverbs 29:25):** Like a rabbit caught in a trap, fear of man paralyzes and prevents action even when one knows what should be done.
- **Israelites in the wilderness (Numbers 13:28–33):** Used as a cautionary example. Overwhelmed by the Canaanites, they described themselves as "grasshoppers" and were defeated in their hearts before the battle — they forgot Jehovah.
- Excessive concern about what others think leads to losing touch with one's obligation and becoming paralyzed.
- **Maintaining fear of God through prayer:** Jesus himself, in **Hebrews 5:7**, offered up supplications and petitions and *"was favorably heard for his godly fear"* — prayer is the key antidote to fear of man.
- **Conclusion — Psalm 16:8:** *"I keep Jehovah before me constantly... because he is at my right hand, I will never be shaken"* — keeping Jehovah constantly in mind provides stability in an unstable world.

---
## 📅 DÍA 4 • Morning Worship: Jehovah's Close Friendship (Proverbs 3:32)

# Morning Worship — Prov. 3:32 — 4 de Septiembre de 2026

> 📖 "For the devious person is detestable to Jehovah, but His close friendship is with the upright." — Proverbios 3:32

- Our honesty can give people a witness of what it means to serve Jehovah. Honesty is rooted in our friendship with Jehovah.
- We are all guests in Jehovah's tent, so we want to imitate him.
- A kind word can really touch the heart. Whenever we see something good, we should say it.
- Jehovah is a friend to those who speak truth in their heart. Being honest means being truthful.
- We can have a close friendship with Jehovah. What does it take to develop and maintain this friendship? **Jeremiah 23:18** mentions the *"inner circle of Jehovah."* We all have a circle of friends, and an inner circle of very close friends with whom we share our most intimate thoughts. It is amazing that we can have this kind of friendship with Jehovah, and we have to work hard to maintain it.

### The Israelites failed to maintain it. Jeremiah mentioned three things:
- **Jeremiah 23:18 — “To see and hear his word.”** The first requirement is to listen to Jehovah. Good listening is necessary to have a close friendship. We need to keep listening to him. He speaks to us through the Bible, meetings, and publications. Before we can help others, we must make sure we are close to him. Bible reading and meditation are not optional.
- **Jeremiah 23:16 — “Do not listen to the words of the false prophets.”** The second requirement is this: Do not let others shape our thinking. We are influenced by Jehovah’s thinking. We cannot rely on our own thinking; we must voice only Jehovah’s opinions. We cannot rest on our own experiences. Experience is no replacement for getting Jehovah’s thoughts on a matter. The more Abraham served Jehovah, the less he relied on himself.
- **Jeremiah 23:22 — “They would help others to obey and turn away.”** The third requirement is this: Help others draw close to Jehovah. We need to take care of our brothers and sisters. If we see a friend drifting, we must be quick to offer help and speak up so they get the help they need. We want them to be in our inner circle.

> 💡 **Punto Clave:** Jehovah’s close friendship is with the upright. It is a great privilege.

---
## 📅 DÍA 7 • Morning Worship: The Rewarder of Those Seeking Him (Hebrews 11:6)

# Morning Worship — Heb. 11:6 — 7 de Septiembre de 2026

> 📖 "He becomes the rewarder of those earnestly seeking him." — Hebreos 11:6

- Ask yourself: In what ways do you see Jehovah's blessings and support today?
- The invitation to approach Jehovah is for everyone. It also reminds us how we should approach others.
- How do we feel when others receive blessings? We might feel entitled—thinking we should have received that privilege. Or we might feel sad, believing we are not good enough. We need to develop contentment and be happy to serve Jehovah as best we can, without comparing ourselves with others.
- Work hard as a teacher, be an example to others, and help young ones. This was the counsel Paul gave to Timothy. Timothy joined Paul as a missionary.

### How can we imitate Timothy?
1. **As a teacher and speaker:** By the time he received this counsel, he was serving as a circuit overseer. **1 Tim. 4:13** says: *“Continue applying yourself to public reading, to exhortation, to teaching.”* Improving as a teacher is an ongoing effort. Verses 16 and 17 say: *“Ponder over these things; be absorbed in them... pay constant attention to yourself and to your teaching.”* Before preparing a talk, we need to meditate on the content of the outline.
2. **As an example:** **1 Tim. 4:12** says: *“Become an example... in speech, conduct...”* By the time he was counseled, he was in his 30s and serving as a circuit overseer. The environment in Ephesus was difficult, and he was there to fortify the brothers and sisters despite real dangers. Enjoy your youth, but keep your main focus on pursuing spiritual goals.
3. **As a preacher:** Reprove and exhort with the art of teaching. If we see someone in spiritual danger, we need to speak up. If the reaction is not what we expect, we must remain patient.

> 💡 If we do that, we can be sure that Jehovah will reward us.

---
## 📅 DÍA 8 • Morning Worship: Jehovah's Power in Patience (2 Kings 17:13)

# Morning Worship — 2 Ki. 17:13 — 8 de Septiembre de 2026

> 📖 "Jehovah kept warning Israel and Judah through all his prophets and every visionary." — 2 Reyes 17:13

- One way Jehovah shows mercy is by how efficiently he provides help.
- Jehovah's patience and mercy are matchless. There is power in patience—it is part of the fruitage of God’s spirit. Calm endurance and deliberate restraint are good ways to describe patience.
- **1 Kings 18:3:** Obadiah obeyed Jehovah and hid the prophets of God. Jezebel wanted to kill them, yet he fed 100 people for a long time. That wasn’t easy during a drought—where would he find enough water and food, and do it without being noticed? He showed calm endurance, and Jehovah helped him save the prophets. The drought lasted three and a half years because Ahab disobeyed Jehovah. Obadiah had to make daily decisions that required courage. He needed to show calm endurance and not dwell on “what if” or “how could.”
- Circumstances may arise that require us to show calm endurance and restrain ourselves. Jesus said that each day has its own problems.
- **1 Kings 18:8:** *“Go and tell your lord that Elijah is here.”* (v. 9) Obadiah was afraid to tell Ahab he had seen Elijah, but by verse 16, *“he went and told Ahab.”* He obeyed despite the danger.
- Patience is powerful. We can accomplish amazing things with patience and trust in Jehovah. It helps us obey and accept events calmly as they happen, not as we wish they would. Patience is like money—its value depends on the skill of the one using it.

---
## 📅 DÍA 9 • Morning Worship: All Scripture Inspired of God (2 Timothy 3:16)

# Morning Worship — 2 Tim. 3:16 — 9 de Septiembre de 2026

> 📖 "All Scripture is inspired of God and beneficial for teaching, for reproving, for setting things straight." — 2 Timoteo 3:16

- Wednesday, September 9 — All Scripture is inspired of God and beneficial. — 2 Tim. 3:16.
- Jehovah is always our partner when preaching, so we need to let him speak by using the Bible.
- **Translation:** What was the first translation of the Bible? The Greek Septuagint. Why Greek? Because of Alexander the Great—Greek culture and language became widespread across the empire. Tradition says there were 72 translators, six from each tribe of Israel. Haggai mentioned the precious things from all the nations, and many of those people did not speak Hebrew. Imagine 72 translators working shoulder to shoulder.
- The apostles used this translation. They did not quote word-for-word but often used meaning-based renderings. Why should we care about the Septuagint? Because it has helped us understand the Bible. Ancient Hebrew is no longer spoken, and there are more than 1,000 Hebrew terms whose original meaning we do not fully know; in those cases, we can consult the Septuagint.
- Some years ago, we studied the term *porneia*. What does it involve? Secular sources helped us understand its full meaning.
- Hebrew fell into disuse after the exile but later returned in Jerusalem. Still, Matthew wrote his Gospel in Hebrew. It seems that, in reality, Hebrew gradually fell out of use after the destruction of Jerusalem in 70 C.E., not in 607 B.C.E.

---
## 📅 DÍA 10 • Morning Worship: The Desolating of Jerusalem (Luke 21:20)

# Morning Worship — Luke 21:20 — 10 de Septiembre de 2026

> 📖 "When you see Jerusalem surrounded by encamped armies, then know that the desolating of her has drawn near." — Lucas 21:20

- Maintaining our spiritual maturity, cultivating God's holy spirit, and discerning God's will can help us stay vigilant.
- **Luke 13:34, 35:** *“Jerusalem, how often I tried to gather you. Look, your house is abandoned to you.”*
- That was a shocking announcement because the city had been very special for the worship of Jehovah. It was called the throne of Jehovah—the theocratic government on earth. All of that changed when the Jews rejected Jesus, though many still believed the city remained part of Jehovah’s worship.
- **Does reverence for Jerusalem have meaning today?** **Galatians 4:26** says, *“Jerusalem from above is our mother.”* Paul spoke about the free woman represented by Sarah. This refers to Jehovah’s heavenly organization; her children include Jesus and the 144,000 anointed.
- Abraham was waiting for the city with real foundations—the heavenly Jerusalem, a kingdom. It refers to the Kingdom of Jesus and the anointed Christians. “New heavens” are new governments.
- **New Jerusalem — Revelation 21:2:** *“The new Jerusalem prepared as a bride, the Lamb’s wife.”* This Jerusalem represents the 144,000 anointed Christians. It is coming down from heaven to the earth to accomplish God’s will on earth.
- The role of the anointed Christians in these Jerusalems is remarkable. We preach to support Christ’s brothers because we love the anointed. It is an act of loyalty. *“I became hungry, sick, thirsty, and you helped me.”* Truly, I say to you: to the extent that you did it to one of the least of these, you did it to me.

---
## 📅 DÍA 11 • Morning Worship: The Lord Was Raised Up (Luke 24:34)

# Morning Worship — Luke 24:34 — 11 de Septiembre de 2026

> 📖 "For a fact the Lord was raised up, and he appeared to Simon!" — Lucas 24:34

- The purpose of our privileges is to encourage others and remind them how special they are.
- The events surrounding Jesus’ death are some of the most moving. Jesus patiently strengthened his disciples.
- Jesus noticed those who were discouraged—like the two disciples walking to Emmaus (**Luke 24:31**). *“We were hoping”* expressed faith, but also disappointment. Jesus opened the Scriptures and encouraged them (v. 32): *“He was fully opening up the Scriptures.”* Their understanding improved. It’s like driving in the dark: we feel stressed, but when the lights come on, we can see.
- **Jesus treasured the sisters:** **John 20:15, 16:** *“Why are you weeping? Mary.”* Mary Magdalene said, *“I have seen the Lord.”* Mary recognized Jesus by the way he spoke to her—by the sound of his voice. Jesus treasured women. We can give them commendation. One kind word can stay with a person for years.
- **Jesus can help us move on beyond bad times—and even beyond mistakes:** Peter denied Jesus three times (**Luke 24:34**): *“He appeared to Simon.”* Jesus gave Peter personal encouragement. Jesus looked beyond Peter’s low moment and saw Peter’s potential. Thomas struggled to believe (**John 20:27**): *“Put your finger here, and stop doubting.”* Those who are sick don’t need criticism, but encouragement and reassurance.
- In his last days, Jesus took to heart the need to encourage his disciples. Jesus no longer performed miracles, but he uses the congregation to encourage his people.
`;

septNote.content = newDaysContent;
septNote.title = 'Daily Text — Septiembre 2026';
septNote.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated daily_text_2026_Septiembre. New content length:', septNote.content.length);

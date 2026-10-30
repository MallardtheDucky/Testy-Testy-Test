/* Placeholder campaign data. Swap for real game state later.
   Letters:  kind = hand | quick | type | tg ; paper = cream | laid | ruled | blue ; optional seal, postmark[2], letterhead{name,sub}, tg{no,words,time}
   Journal:  body strings accept ~~strike~~ and __underline__.
   Newspaper edition: {date,no,year,unread,lead:{head,deck,body[]},cols:[{head,deck,body[]} | {ad:true,cls,head,lines[]}]}  ("a|b" line = price row) */
window.REPUBLIKA_DATA = {
  state: { year: 1892, month: 6 /* 0=Jan */, turn: 7, funds: 1200, reputation: 35, character: { name: "Your Character", occupation: "Junior clerk and small trader, Binondo", tags: ["trader","clerk","tondo"] } },
  months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  outbox: [], /* sent letters: {ref,to,subject,written,body,label,delivers,due,reply,replyLetter,re} */
  badges: { politics: 0, standing: 0 },
  briefing: [{ when: "July 1892", text: "Word from Manila: the Governor-General has received Dr. Rizal at the Palace." }],
  letters: [
    { ref:"CORR-92-036", unread:true, kind:"tg", paper:"cream", subject:"Cable from Hong Kong", from:"Agent at Hong Kong", role:"Telegram", place:"Hong Kong", date:"6 July 1892",
      tg:{ no:"412", words:"17", time:"3.15 p.m." }, body:["ARRIVED SAFELY.","FRIENDS ABROAD AWAIT","YOUR NEWS. SEND NOTHING","BY POST. BURN THIS."], sign:"" },
    { ref:"CORR-92-031", unread:true, kind:"quick", paper:"cream", seal:"M", postmark:["BINONDO","28 JUN 92"], subject:"On the matter of the warehouse accounts", from:"Don Eusebio Maranan", role:"Merchant, Binondo",
      place:"Calle Escolta, Binondo", date:"28 June 1892", salutation:"Estimado amigo,",
      body:["I write in haste and in some discomfort. The accounts we spoke of are not as they should be, and I would sooner say so on paper than across a counter where clerks have ears.","Come to the shop after the Angelus on Thursday, and speak to no one of it. I will have the books laid out and a pot of chocolate on the stove."],
      sign:"Eusebio Maranan" },
    { ref:"CORR-92-029", unread:true, kind:"quick", paper:"ruled", postmark:["KAWIT","22 JUN 92"], subject:"A word from Kawit", from:"Doña Felisa Aragón", role:"Fish dealer, Kawit",
      place:"Kawit, Cavite", date:"22 June 1892", salutation:"My dear friend,",
      body:["The boats came in light again this week, and prices on the quay are what they were in the bad year. Yet it is not the fish that people whisper about.","Men who used to quarrel over nets now sit together after dark and fall silent when a guardia passes. I do not know what it means, but I thought you would wish to hear it from me."],
      sign:"Felisa Aragón" },
    { ref:"CORR-92-027", unread:false, kind:"type", paper:"blue", letterhead:{ name:"Hartwell & Lowe", sub:"Commission Merchants · Calle Nueva, Binondo · Cable: HARLOW" }, subject:"Freight to Hong Kong", from:"Hartwell & Lowe", role:"Commission merchants",
      place:"Calle Nueva, Binondo", date:"14 June 1892", salutation:"Dear Sir,",
      body:["Referring to your inquiry of the 9th inst., we beg to quote freight on general cargo to Hong Kong at $4.50 per ton, payable on shipment.","The steamer sails on the 20th prox. Space is limited, and we would advise an early reply. Parcels of a private nature are carried at the owner’s risk."],
      close:"Yours faithfully,", sign:"J. Lowe" },
    { ref:"CORR-92-024", unread:false, kind:"type", paper:"cream", letterhead:{ name:"Imprenta La Fe", sub:"Printers & Stationers · Calle Anloague, Manila" }, subject:"Concerning your subscription", from:"Imprenta La Fe", role:"Printers, Manila",
      place:"Calle Anloague, Manila", date:"9 June 1892", salutation:"Most esteemed Sir,",
      body:["We acknowledge receipt of your remittance and have the honour to inform you that the periodicals you ordered shall be forwarded by the next steamer, subject to the censor’s pleasure."],
      close:"Your obedient servants,", sign:"The Proprietors" },
    { ref:"CORR-92-017", unread:false, kind:"hand", paper:"laid", seal:"✠", postmark:["TONDO","30 MAY 92"], subject:"A gentle caution", from:"Rev. Fr. Anselmo Reyes", role:"Parish priest",
      place:"Convento de Tondo", date:"30 May 1892", salutation:"My son,",
      body:["It has reached my ears that you are seen in company I should not choose for you. I do not accuse; I only ask that you remember how long a memory the authorities keep, and how short the patience of the Guardia Civil.","My door, as ever, is open to you."],
      sign:"Fr. Anselmo" }
  ],
  journal: [
    { date:"3 July 1892", place:"Tondo, Manila", unread:true, title:"Lights in Ilaya Street",
      body:["Passing along Ilaya after dark I saw a house lit from end to end, and a row of hats and canes by the door. Gentlemen of standing, and not one of them in a hurry to be seen.","I did not stop. ~~I wanted to.~~ Funds are thin, and I must be useful to myself before I can be useful to anyone."] },
    { date:"27 June 1892", place:"Binondo", unread:true, title:"What was said at table",
      body:["The whole city talks of yesterday’s steamer and the passenger who came off it. There was talk of reform over supper, and then talk of something warmer than reform. No one named it.","I have learned that what is not said is often the __substance__ of the evening."] },
    { date:"14 June 1892", place:"Tondo, Manila", unread:true, title:"A letter unanswered",
      body:["I have left a letter unanswered for nine days now. It is not idleness. To reply is to take a side, and I am not yet certain which I can afford."] },
    { date:"2 June 1892", place:"Tondo, Manila", unread:false, title:"Rain on the roofs",
      body:["The first heavy rains have come. The streets are rivers and the carriages stay home, so the whole city seems to wait. I find I do not mind waiting, so long as I know what for."] }
  ],
  newspaper: [
    { name:"El Porvenir de Manila", tag:"Diario político, comercial y de avisos", cls:"n-porvenir", place:"Manila · 4 cuartos", voice:"Government-friendly daily", articles:[
      { date:"7 July 1892", unread:true, head:"Dr. Rizal Detained by Order of the Governor-General", deck:"Conducted to Fort Santiago after an audience at the Palace",
        body:["It is reported in the capital that Dr. D. José Rizal, who arrived in Manila scarcely a fortnight since, was taken into custody on the evening of the 6th inst. and lodged within the walls of Fort Santiago.","His Excellency Gen. Despujol has made no statement. Persons of the first respectability have called at the Palace to inquire, and have been courteously received and told nothing."] },
      { date:"7 July 1892", unread:true, head:"The Guardia Civil Reinforced in Cavite", deck:"Precautionary measure, says the Comandancia",
        body:["Two additional detachments have been posted to the towns along the bay, solely, we are assured, to protect the peaceable inhabitants from the idle and the ill-disposed."] },
      { date:"30 June 1892", unread:false, head:"Arrival of Dr. Rizal in the Capital", deck:"A quiet reception at the quay",
        body:["The well-known physician and author disembarked on Sunday last and proceeded to the house of a relative in the city. A small number of friends attended at the quay, and no disorder of any kind was observed.","His intentions are said to be of a private character, namely to rejoin his family."] } ] },
    { name:"Diario Mercantil", tag:"Commerce · Shipping · Exchange", cls:"n-mercantil", place:"Binondo · 2 cuartos", voice:"Trade paper", articles:[
      { date:"7 July 1892", unread:true, head:"Prices Current at the Port", deck:"Steady demand for hemp; sugar easier",
        body:["Rice, per cavan|$2.30","Sugar, per picul|$4.10","Hemp, Class I, per picul|$11.50","Tobacco, per quintal|$9.00","The mail steamer from Hong Kong is expected on Saturday. Cargo for Iloilo and Cebu will be received at the Muelle until noon on Friday."] },
      { date:"6 July 1892", unread:true, head:"Merchants Uneasy at the Arrest", deck:"Insurance rates on warehouse stock considered",
        body:["Several houses in Binondo report a drop in custom since the news from Fort Santiago was known. Underwriters decline to say whether premiums will be raised, but are understood to be watching the street."] } ] },
    { name:"El Reformista", tag:"Fortnightly review of Filipino affairs · Madrid", cls:"n-reformista", place:"Madrid · 10 céntimos", voice:"Liberal reform journal", articles:[
      { date:"1 July 1892", unread:true, head:"A Prudent Man Is Not a Danger to the State", deck:"On the return of a certain physician to his native land",
        body:["It is a poor government that fears a pen. The gentleman who has come home to his family asks for schools, for justice before the law, and for a voice in the Cortes; are these the demands of a conspirator?","We say plainly that every harshness shown to the moderate will be remembered by the impatient. Let Manila take note."] },
      { date:"1 July 1892", unread:false, head:"The Cortes and the Colony: A Silence of Years", deck:"No deputy has risen for the Philippines this session",
        body:["The islands pay their taxes and send their sons to the Spanish ranks, yet the benches that should speak for them stand empty. We ask only that someone remember the debt."] } ] },
    { name:"Boletín Eclesiástico", tag:"Official organ of the Archdiocese", cls:"n-boletin", place:"Manila · Gratis", voice:"Church bulletin", articles:[
      { date:"3 July 1892", unread:true, head:"Pastoral Reminder on Secret Societies", deck:"The faithful are warned against lodges and clubs of foreign origin",
        body:["The parish clergy are instructed to remind their flocks that membership in Masonic lodges and like associations is condemned by Holy Church and by the laws of Spain.","Fathers of families are urged to know with whom their sons keep company after the Angelus."] },
      { date:"3 July 1892", unread:false, head:"Feast of the Visitation: Order of Processions", deck:"Notice to the parishes of the archdiocese",
        body:["Processions will leave the churches at the usual hour, and the faithful are asked to keep to the appointed streets and to give no occasion for disturbance."] } ] },
    { name:"The Eastern Courier", tag:"An English journal for the China coast", cls:"n-courier", place:"Hong Kong · 10 cents", voice:"Foreign press", articles:[
      { date:"5 July 1892", unread:true, head:"Manila Notes: A Quiet Capital?", deck:"From our own correspondent",
        body:["The authorities profess that all is calm, yet mounted patrols of the Guardia Civil now pass through the northern suburbs after dark, a thing not seen at this season in memory.","Foreign merchants report trade unaffected, but speak in lowered voices on certain subjects."] },
      { date:"5 July 1892", unread:true, head:"Filipino Exiles in Hong Kong: Their Numbers Grow", deck:"A small colony gathers around Wanchai",
        body:["Young men from Manila and the Visayas continue to arrive on every steamer. They are polite, poor, and well read, and they ask a great many questions about the law of the colony."] } ] },
    { name:"Hoja Suelta", tag:"Copied by hand · Pass it on · Then burn it", cls:"n-hoja", place:"No place · No price", voice:"Underground sheet", articles:[
      { date:"No date", unread:true, head:"To the Sons of the Country", deck:"",
        body:["They tell us that patience is a virtue. Our fathers were patient, and their sons now pay the rent for it.","Be ready, be silent, and know who stands beside you. The hour will not announce itself."] },
      { date:"No date", unread:true, head:"Who Informs, Who Is Informed", deck:"",
        body:["A name was spoken in the Tondo market and a day later a door was broken. Count your friends, and count them again."] } ] }
  ],
  monthlyNews: [
    "Rumours of unrest spread through the provinces.",
    "A merchant ship arrives from Hong Kong with letters.",
    "The Governor-General issues a new decree."
  ]
};

/* ---- Letters module data: received dates, recipients' options, more mail ----
   Letter extras: recv (date received), far (slow: Hong Kong/Madrid), req (tags the player needs to receive it), opts[] = response options.
   Option: {label, text (what the player writes), rep, funds, in (turns until reply), reply (text of the reply letter, optional)} */
(function (D) {
  const X = {
    "CORR-92-036": { recv: "7 July 1892", far: true },
    "CORR-92-031": { recv: "1 July 1892", opts: [
      { label: "Accept", text: "I will come on Thursday after the Angelus and say nothing to anyone. Keep the books where only the two of us can read them.", rep: 1, reply: "Good. Come by the side door. I have found a second set of figures that will interest you more than the first." },
      { label: "Ask a question", text: "Before I walk across the city, tell me plainly: is it our own accounts that are wrong, or someone else’s that we are made to carry?", reply: "Someone else’s, my friend, and those someone elses sign the licences. Come, and you shall see it written." },
      { label: "Offer to audit the books", req: ["clerk"], text: "As a clerk I know how a double set of figures is kept. Let me go through both sets with you on Thursday, and I will mark what cannot be explained.", rep: 2, reply: "That is exactly what I hoped you would offer. Bring a pencil and your good eyes." },
      { label: "Refuse", text: "I cannot be seen at your shop this week. Send the figures by a trusted boy and I will answer in writing.", rep: -1 } ] },
    "CORR-92-029": { recv: "27 June 1892", opts: [
      { label: "Offer assistance", text: "I can spare ₱40 against the bad season and speak to the Binondo buyers about a better price for your catch.", funds: -40, rep: 2, reply: "God repay you. The money will go to the boats, and I will tell the men whose hand it came from, if you permit." },
      { label: "Ask a question", text: "Who are the men who fall silent when the guardia passes? Names stay with me. I wish only to know whether they are our neighbours.", reply: "Our neighbours, yes, and some from Imus and Noveleta. They meet at the Aragón boathouse. Ask no more by post." },
      { label: "Express an opinion", text: "Silence is the beginning of every understanding, and this one is older than the guardia. Keep your ears open and your mouth shut.", rep: 1 } ] },
    "CORR-92-027": { recv: "16 June 1892", opts: [
      { label: "Accept the quote", text: "Please reserve space for four tons on the steamer of the 20th prox. Payment will be made on shipment.", funds: -18, reply: "Space reserved, four tons, steamer of the 20th. Kindly present your cargo at the Muelle by noon on the 19th." },
      { label: "Ask a question", text: "Is the rate fixed, or will it rise if the steamer is full? And are parcels of a private nature inspected at Hong Kong?", reply: "The rate is fixed through the month. Inspection is at the discretion of the Harbour Master, and we advise nothing." } ] },
    "CORR-92-024": { recv: "11 June 1892" },
    "CORR-92-017": { recv: "1 June 1892", opts: [
      { label: "Reassure", text: "Father, I have done nothing to shame the Church or my family. I keep the company of men who read, and I take your counsel to heart.", rep: 1, reply: "I am relieved to read it. Come to Mass on Sunday and sit where I can see you." },
      { label: "Express an opinion", text: "With respect, Father, a man cannot be blamed for those he is seen talking to, only for what he does afterwards.", rep: -1, reply: "That is a lawyer’s answer, my son, and the Guardia Civil are not lawyers. My door remains open." } ] }
  };
  Object.keys(X).forEach((k) => Object.assign(D.letters.find((l) => l.ref === k), X[k]));
  D.letters.unshift(
    { ref: "CORR-92-038", unread: true, kind: "hand", paper: "laid", seal: "T", postmark: ["TONDO", "5 JUL 92"], subject: "The fiesta at home", from: "Doña Remedios (your mother)", role: "Family, Tondo",
      place: "Calle Ilaya, Tondo", date: "4 July 1892", recv: "5 July 1892", salutation: "Anak,",
      body: ["Your aunt and the cousins are coming for the fiesta, and the house will be full. I want you at table on the 25th, and I do not want to hear about the shop.", "Bring something for your sister’s schooling if you can. She has been asking again."],
      sign: "Your mother",
      opts: [ { label: "Accept", action: { type: "visit", id: "family-fiesta" }, text: "I will be home on the 25th and bring what I can for Luisa’s schooling. Please keep a place at table for me.", funds: -30, rep: 1, reply: "Good. Your sister will say nothing, but she will be glad." },
              { label: "Ask for details", text: "Who exactly is coming? And is Tío Ramón still on bad terms with the cousins? I would rather know before I sit down.", reply: "Ramón will be there and so will his opinions. Wear your good coat." },
              { label: "Decline", text: "I cannot be away from Binondo that week, Nanay, but I will send money for the fiesta and visit before the month is out.", funds: -20, rep: -1 } ] },
    { ref: "CORR-92-037", unread: true, kind: "type", paper: "cream", letterhead: { name: "Ayuntamiento de Manila", sub: "Oficina de Cédulas Personales · Intramuros" }, subject: "Cédula for the second half of the year", from: "Municipal Clerk", role: "Official, City Hall",
      place: "Intramuros", date: "2 July 1892", recv: "4 July 1892", salutation: "Sir,", close: "Your obedient servant,", sign: "Secretary, Oficina de Cédulas",
      body: ["You are required to renew your personal registration certificate (cédula) before the end of this month. The fee is ₱1.50 for the class in which you are entered.", "Failure to produce the certificate on demand of the Guardia Civil is punishable by arrest and a fine."],
      opts: [ { label: "Pay the fee", text: "Enclosed is the fee of ₱1.50 for my cédula. Kindly return the certificate by the next post.", funds: -2, reply: "Receipt acknowledged. Your certificate will be ready for collection at the window on Tuesdays." },
              { label: "Ask a question", text: "Please confirm which class I am entered in. I believe it should be the lowest class for a clerk of my salary.", reply: "The classification stands. If you dispute it, appear in person with your employer’s statement." } ] },
    { ref: "CORR-92-035", unread: true, kind: "quick", paper: "ruled", postmark: ["TONDO", "3 JUL 92"], subject: "A meeting at Ilaya Street", from: "A friend in the Propaganda", role: "Political contact",
      place: "Tondo", date: "3 July 1892", recv: "4 July 1892", salutation: "Friend,",
      body: ["There is to be a gathering on Sunday evening at a house on Ilaya, to talk about a league of Filipinos that would help one another in trade, in schooling, and in law. Dr. Rizal is expected.", "I name no names here. If you wish to come, answer yes and I will tell you the door and the hour. If not, say nothing and burn this."],
      sign: "—",
      opts: [ { label: "Accept the invitation", action: { type: "attend", id: "ilaya-meeting" }, text: "Yes. Send me the door and the hour, and I will come as one among others and say little.", rep: 3, reply: "The house with the green shutters, at eight, after the lamps are lit. Tell no one where you are going, not even your priest." },
              { label: "Ask a question", text: "Before I answer, tell me who chairs it and what is demanded of those who join. I am a clerk and cannot lose my place.", reply: "No one chairs it, and nothing is demanded but a name on a list that you will be asked to keep in your head. Think on it." },
              { label: "Refuse", text: "I thank you, but I must keep clear of gatherings this month. I wish the cause well and will not repeat it.", rep: -2 } ] },
    { ref: "CORR-92-034", unread: true, kind: "type", paper: "blue", far: true, postmark: ["MADRID", "10 JUN 92"], letterhead: { name: "La Solidaridad", sub: "Quincenal democrático · Madrid" }, subject: "A request for correspondence", from: "Editorial office, La Solidaridad", role: "Reformist journal, Madrid",
      place: "Madrid", date: "10 June 1892", recv: "6 July 1892", salutation: "Estimado compatriota,", close: "Yours,", sign: "The Editors",
      body: ["We ask the friends of reform in Manila to send us accurate reports of local conditions, particularly of taxes, the friar estates, and the conduct of the Guardia Civil. Signed pieces are welcome, but we shall print under any name you choose."],
      opts: [ { label: "Offer to write", text: "I will send you a plain account of the rents at Binondo and the conduct of the guardia in Tondo, under the name of ‘A Clerk of the Port’.", rep: 2, in: 3, reply: "Received with thanks. Your account will appear in the next number. Send more, and keep the facts exact." },
              { label: "Express an opinion", text: "Your cause is just, but a letter of that kind put into the wrong hands would cost me my position. I will help in other ways.", rep: -1 } ] },
    { ref: "CORR-92-033", unread: true, kind: "type", paper: "cream", req: ["official"], letterhead: { name: "Palacio de Malacañang", sub: "Secretaría del Gobierno General" }, subject: "Summons to the Palace", from: "Office of the Governor-General", role: "Official",
      place: "Manila", date: "5 July 1892", recv: "6 July 1892", salutation: "Sir,", close: "By order,", sign: "The Secretary",
      body: ["Your attendance is required at the Palace on the 10th inst. at ten o’clock to give your opinion on the matter of the public peace."], opts: [ { label: "Attend", text: "I shall attend at the appointed hour.", rep: 1 } ] }
  );
  if (window.RepublikaScreens) RepublikaScreens.sortInbox(); else D.letters.sort((a, b) => (Date.parse(b.recv || b.date) || 0) - (Date.parse(a.recv || a.date) || 0));
})(window.REPUBLIKA_DATA);

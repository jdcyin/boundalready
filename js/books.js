// The reading list. To add a book, copy one entry, change the details, and put its cover in /covers/<id>.jpg.
//
//   id          short name used for the cover file: covers/<id>.jpg
//   title       the title in the book's original language (e.g. "兄弟")
//   titleEn     for a book read in another language, its English title; shown in brackets
//               after the original, e.g. 兄弟 (Brothers). Leave out for English titles.
//   readIn      the language(s) you read it in, e.g. ["English"] or ["English", "Chinese"]
//   year/month/day   when you finished it (year:null if you don't remember; it sorts last)
//   country     where the book is set (can be several)
//   genre       kept for your own reference
//   format      "paper" (can be lent), "ebook" or "audiobook"
//   onLoan      set to true while someone has borrowed it
//   pages       roughly; sets how thick the spine is on the shelf
//   reflection  your notes. Leave a blank line between paragraphs; a paragraph
//               starting with a quotation mark is shown as a quote from the book.
//
// Spine designs live in js/app.js under SPINES. A book without one gets a plain coloured spine.

const BOOKS = [
  {id:"brothers", title:"兄弟", titleEn:"Brothers", author:"Yu Hua", last:"Yu Hua", year:2026, month:9, day:null, country:["China"], genre:"Literary", lang:null, readIn:["Chinese"], format:"paper", onLoan:false, pages:640, color:0, cover:true,
   reflection:"Yu Hua is a master of tragedy, but somehow this book was longer than it was captivating. Some of the characters are unrealistic to the point of making me feel like they were unrelatable."},
  {id:"ah-q", title:"阿Q正傳", titleEn:"The True Story of Ah Q", author:"Lu Xun", last:"Lu Xun", year:2020, month:null, day:null, country:["China"], genre:"Literary", lang:null, readIn:["English", "Chinese"], format:"paper", onLoan:false, pages:160, color:6, cover:true,
   reflection:"Not particularly interesting; a story about an idiot that makes his way through life. Idiotic to the point of comedy."},
  {id:"wild-grass", title:"野草", titleEn:"Wild Grass", author:"Lu Xun", last:"Lu Xun", year:2020, month:null, day:null, country:["China"], genre:"Poetry", lang:null, readIn:["English", "Chinese"], format:"paper", onLoan:false, pages:150, color:9, cover:true,
   reflection:"I don’t think my Chinese is at a level where I can totally appreciate Chinese poetry. Short and digestible book, interesting musings."},
  {id:"japanese-short-stories", title:"The Penguin Book of Japanese Short Stories", author:"Jay Rubin (ed.)", last:"Rubin", year:2022, month:null, day:null, country:["Japan"], genre:"Short stories", lang:"Japanese", readIn:["English"], format:"paper", onLoan:false, pages:560, color:1, cover:true,
   reflection:"Japan has such a dedication to craft that this collection of short stories has some of pretty sick (grotesque), and just plain weird themes. So sick and weird that it’s fascinating."},
  {id:"stay-true", title:"Stay True", author:"Hua Hsu", last:"Hsu", year:2025, month:8, day:1, country:["USA"], genre:"Memoir", lang:null, readIn:["English"], format:"paper", onLoan:false, pages:208, color:7, cover:true,
   reflection:"A great mix of story and philosophy wrapped into a beautiful memoir, set in a place very close to home. Recommend to all my Bay Area people."},
  {id:"general-in-his-labyrinth", title:"The General in his Labyrinth", author:"Gabriel García Márquez", last:"García Márquez", year:2025, month:5, day:16, country:["Colombia"], genre:"Historical", lang:"Spanish", readIn:["English"], format:"paper", onLoan:false, pages:285, color:2, cover:true,
   reflection:"Couldn’t get through it. Littered with historical references. I’ll chalk it down to my ignorance on Simon Bolivar and Gran Colombia."},
  {id:"love-in-the-time-of-cholera", title:"Love in the Time of Cholera", author:"Gabriel García Márquez", last:"García Márquez", year:2025, month:3, day:23, country:["Colombia"], genre:"Romance", lang:"Spanish", readIn:["English"], format:"paper", onLoan:false, pages:348, color:0, cover:true,
   reflection:"Absolute mastery of romantic prose with all the mystery, beauty, and disgust of finding love in the strangest of places."},
  {id:"the-vegetarian", title:"The Vegetarian", author:"Han Kang", last:"Han Kang", year:2024, month:11, day:15, country:["South Korea"], genre:"Literary", lang:"Korean", readIn:["English"], format:"paper", onLoan:false, pages:188, color:5, cover:true,
   reflection:"This book is twisted to the point of brilliance. I really liked the use of language to paint a scene. Great for a one-day read through."},
  {id:"the-plague", title:"The Plague", author:"Albert Camus", last:"Camus", year:2024, month:10, day:20, country:["Algeria"], genre:"Classic", lang:"French", readIn:["English"], format:"paper", onLoan:false, pages:308, color:1, cover:true,
   reflection:"I often wonder if how impactful art is is defined by how well it lasts. And part of that lasting power depends on how much it applies to multiple situations across time. Spoiler alert – the last line in the book made believe why Camus’s novel was so powerful, then and now:\n\n“He knew what those jubilant crowds did not know but could have learned from books: that the plague bacillus never dies or disappears for good; that it can lie dormant for years and years in furniture and linen chests; that it bides its time in bedrooms, cellars, trunks, and bookshelves; and that perhaps the day would come when, for the bane and the enlightening of men, it would rouse up its rats again and send them forth to die in a happy city.”"},
  {id:"cold-nights", title:"Cold Nights", author:"Pa Chin", last:"Pa Chin", year:2024, month:1, day:19, country:["China"], genre:"Literary", lang:null, readIn:["English"], format:"paper", onLoan:false, pages:190, color:8, cover:true,
   reflection:"The novel takes place in 1930’s China, Szechwan, as the Japanese advance on China. It tells the story of a family slowly falling apart, used as a metaphor for paralleling the hopelessness of China during its colonial takeover. A dark novel with constant atmospheric doom. As you follow the main character, a former intellectual, you see him slowly become a shadow of his former self as he withers. This is paralleled with an allegory of night, seemingly darkening his shadowyness.\n\nThe language is easy to read (read in Chinese, but English translation is the same). Short, sharp shooting, and descriptive. Not a fan of the writing, but it’s a page turner."},
  {id:"afterparties", title:"Afterparties", author:"Anthony Veasna So", last:"So", year:2021, month:12, day:1, country:["USA"], genre:"Short stories", lang:null, readIn:["English"], format:"paper", onLoan:false, pages:272, color:3, cover:true,
   reflection:"The book was made aware to my by a colleague, who’d recommended it on its ‘edginess’, and how it had reminded them of me. The story is written by So, a gay, Cambodian-American (not Asian-American) kid, who grew up in Stockton, California. He weaves in the narratives of the people he grew up with across chapters, alongside themes of genocide, immigration, queerness, and its unfolding in suburban, middle America.\n\nTwo chapters especially stuck out. Spoiler alert for those planning to read it. First is the chapter on the afterparty of a cousin’s wedding, whereby So uses the afterparty as the metaphor for grounds where all the pleasures of the present and pains of the past converge, as told through the lens of two brothers. So overlays this chapter beautifully with dialogue and narrative that is both desperate and hopeful, jaded but yearning, for something more (making meaning of the present via the past).\n\nThe second chapter that stuck out was the final one, in which So writes from the perspective of his mother to him, as she recounts a memory she had of So. The mother speaks to him from afar, a distant tone, but one in which the mother sees truth about how So is in the world. By writing from the mothers view, So vocalises how he has come to be from his mother’s past; how she has shaped him, and ultimately inspired him to write – and, since his passing, leave behind – this book.\n\nA great read. Simple, and relatable."},
  {id:"moby-dick", title:"Moby Dick", author:"Herman Melville", last:"Melville", year:2021, month:7, day:22, country:["USA"], genre:"Classic", lang:null, readIn:["English"], format:"paper", onLoan:false, pages:635, color:6, cover:true,
   reflection:"People don’t write adventure novels like this anymore. Great storytelling and encyclopedic knowledge of whales."},
  {id:"the-corrections", title:"The Corrections", author:"Jonathan Franzen", last:"Franzen", year:2020, month:3, day:29, country:["USA"], genre:"Literary", lang:null, readIn:["English"], format:"paper", onLoan:false, pages:566, color:4, cover:true,
   reflection:"The droll of middle-America and the desire to break out of it, set to the backdrop of the 1990’s. Great language and prose."},
];

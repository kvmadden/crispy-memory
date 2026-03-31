import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";

/* Jennarate: Food Logic by Madden Frameworks */

var MEAL_DEFS=[
{id:"breakfast",label:"Breakfast",greeting:"Good morning",cta:"Resolve Breakfast",sub:"Start the day right",emoji:"\u2600\uFE0F",treatOk:false,lightBias:true},
{id:"brunch",label:"Brunch",greeting:"Late morning",cta:"Resolve Brunch",sub:"Weekend brunch mode",emoji:"\uD83E\uDD5E",treatOk:false,lightBias:true},
{id:"lunch",label:"Lunch",greeting:"Afternoon",cta:"Resolve Lunch",sub:"Midday fuel needed",emoji:"\uD83C\uDF24\uFE0F",treatOk:false,lightBias:false},
{id:"dinner",label:"Dinner",greeting:"Good evening",cta:"Resolve Dinner",sub:"The main event",emoji:"\uD83C\uDF7D\uFE0F",treatOk:false,lightBias:false},
{id:"latenight",label:"Late Night",greeting:"Late night",cta:"Resolve a Late Night Run",sub:"No judgment at this hour",emoji:"\uD83C\uDF1C",treatOk:true,lightBias:false}
];
var DEFAULT_MEAL_TIMES={breakfast:[4.5,8.5],brunch:[8.5,10.5],lunch:[10.5,15],dinner:[15,21],latenight:[21,4.5]};

function getMealContext(override,customTimes){
if(override){
var md=MEAL_DEFS.find(function(m){return m.id===override;});
if(md)return Object.assign({},md,{meal:md.id});
}
var h=new Date().getHours();
var times=customTimes||DEFAULT_MEAL_TIMES;
var order=["breakfast","brunch","lunch","dinner","latenight"];
for(var i=0;i<order.length;i++){
var mid=order[i];
var range=times[mid]||DEFAULT_MEAL_TIMES[mid];
if(!range)continue;
var s=range[0],e=range[1];
if(s<e){if(h>=s&&h<e){var d=MEAL_DEFS.find(function(m){return m.id===mid;});if(d){return Object.assign({},d,{meal:d.id});}}}
else{if(h>=s||h<e){var d2=MEAL_DEFS.find(function(m){return m.id===mid;});if(d2)return Object.assign({},d2,{meal:d2.id});}}
}
return{meal:"latenight",label:"Late Night",greeting:"Can't sleep?",cta:"Resolve a Late Night Run",sub:"We don't ask questions at this hour",emoji:"\uD83E\uDD89",treatOk:true,lightBias:true};
}

var GLOBAL_DEFAULTS={femaleWeight:true,dessertPenalty:true,h2hFemale:true,theme:"auto"};
var QR_DEFAULTS=[{l:"Nugget Protocol",e:"\uD83E\uDDF8",g:["kevin","jenna","madi","jack","emmy"],m:"kid-peace",meals:["breakfast","brunch","lunch","dinner"]},{l:"Zero Regrets",e:"\uD83D\uDD25",g:["kevin"],m:"trash-goblin",meals:["dinner","latenight"]},{l:"Sugar Rush",e:"\uD83C\uDF6A",g:["kevin","jenna"],m:"sweet-treat",meals:[]},{l:"Kevin After Dark",e:"\uD83C\uDF1C",g:["kevin"],m:"trash-goblin",meals:["latenight"]},{l:"Salad Era",e:"\uD83E\uDD57",g:["kevin","jenna"],m:"healthy",meals:["brunch","dinner","lunch"]},{l:"Just Feed Me",e:"\u26A1",g:["kevin"],m:"safe-default",meals:["breakfast","brunch","lunch"]},{l:"Slow Start",e:"\uD83D\uDECB\uFE0F",g:["kevin","jenna"],m:"comfort",meals:["breakfast","brunch"]},{l:"Full House Mode",e:"\uD83E\uDD1D",g:["kevin","jenna","madi","jack","emmy","jenna-mom","jenna-dad"],m:"crowd-survival",meals:["dinner","latenight"]}];
var PEOPLE=[{id:"kevin",name:"Kevin",freq:"core",age:"adult",emoji:"\uD83D\uDC68",g:"m",adv:.65,hc:.3,sp:.3,meat:.9,sweet:.9,mods:[{rid:"subway",w:8,label:"Solo spot",solo:true},{rid:"panda-express",w:6,label:"Solo variety pick",solo:true},{rid:"firehouse-subs",w:4,label:"Solo sub shop",solo:true},{rid:"potbelly",w:4,label:"Solo sub shop",solo:true}]},{id:"jenna",name:"Jenna",freq:"core",age:"adult",emoji:"\uD83D\uDC69",g:"f",adv:.35,hc:.6,sp:.55,meat:.3,sweet:.5,mods:[{rid:"sweetfrog",w:8,label:"Default treat"},{rid:"checkers",w:4,label:"Loves the fries"},{rid:"potbelly",w:3,label:"Likes it"},{rid:"chicken-salad-chick",w:3,label:"Likes it"}]},{id:"madi",name:"Madi",freq:"core",age:"toddler",emoji:"\uD83D\uDC67",g:"f",adv:.35,hc:.3,sp:.15,meat:.4,sweet:.85,mods:[]},{id:"jack",name:"Jack",freq:"core",age:"toddler",emoji:"\uD83D\uDC66",g:"m",adv:.3,hc:.25,sp:.05,meat:.7,sweet:.8,mods:[]},{id:"emmy",name:"Emmy",freq:"core",age:"baby",emoji:"\uD83D\uDC76",g:"f",adv:.1,hc:.3,sp:.0,meat:.4,sweet:.7,mods:[]},{id:"jenna-mom",name:"Jenna's Mom",freq:"extended",age:"adult",emoji:"\uD83D\uDC75",g:"f",adv:0.35,hc:0.55,sp:0.35,meat:0.4,sweet:0.5,mods:[]},{id:"jenna-dad",name:"Jenna's Dad",freq:"extended",age:"adult",emoji:"\uD83D\uDC74",g:"m",adv:0.25,hc:0.4,sp:.45,meat:0.6,sweet:0.45,mods:[{rid:"taco-bell",w:-6,label:"Dislikes saucy meals"},{rid:"chipotle",w:-6,label:"Dislikes saucy meals"},{rid:"cantina",w:4,label:"Dad approved"},{rid:"chick-fil-a",w:3,label:"Prefers plain food"},{rid:"jersey-mikes",w:3,label:"Prefers plain food"},{rid:"subway",w:3,label:"Prefers plain food"},{rid:"panera",w:3,label:"Prefers plain food"}]},{id:"kevin-mom",name:"Kevin's Mom",freq:"extended",age:"adult",emoji:"\uD83D\uDC69\u200d\uD83E\uDDB3",g:"f",adv:0.1,hc:0.5,sp:0.1,meat:0.3,sweet:0.4,mods:[{rid:"chick-fil-a",w:10,label:"Safe pick"},{rid:"panera",w:4,label:"Comfort pick"},{rid:"culvers",w:4,label:"Comfort pick"},{cat:"indian",w:-8,label:"Too adventurous"},{cat:"asian",w:-3,label:"Will find the chicken lo mein"}]},{id:"zoe",name:"Zoe",freq:"extended",age:"adult",emoji:"\uD83D\uDC69\u200d\uD83C\uDFA4",g:"f",adv:0.4,hc:0.55,sp:0.4,meat:0.4,sweet:0.5,mods:[]},{id:"derek",name:"Derek",freq:"occasional",age:"adult",emoji:"\uD83E\uDDD1\u200d\uD83D\uDCBC",g:"m",adv:0.55,hc:0.4,sp:0.5,meat:0.6,sweet:0.5,mods:[]},{id:"wyatt",name:"Wyatt",freq:"occasional",age:"child",emoji:"\uD83E\uDDD2",g:"m",adv:.25,hc:.3,sp:.1,meat:.5,sweet:.8,mods:[]},{id:"beckham",name:"Beckham",freq:"occasional",age:"child",emoji:"\uD83E\uDDD2",g:"m",adv:.25,hc:.3,sp:.1,meat:.5,sweet:.8,mods:[]},{id:"zara",name:"Zara",freq:"occasional",age:"child",emoji:"\uD83D\uDC67",g:"f",adv:.25,hc:.3,sp:.1,meat:.5,sweet:.8,mods:[]},{id:"leah",name:"Leah",freq:"extended",age:"adult",emoji:"\uD83D\uDC69\u200d\uD83C\uDFA8",g:"f",adv:0.45,hc:0.5,sp:0.45,meat:0.45,sweet:0.55,mods:[]},{id:"corey",name:"Corey",freq:"occasional",age:"adult",emoji:"\uD83E\uDD19",g:"m",adv:0.55,hc:0.4,sp:0.5,meat:0.6,sweet:0.5,mods:[]},{id:"tara",name:"Tara",freq:"occasional",age:"adult",emoji:"\uD83D\uDC83",g:"f",adv:0.25,hc:0.45,sp:0.2,meat:0.5,sweet:0.55,mods:[]},{id:"tyler",name:"Tyler",freq:"occasional",age:"adult",emoji:"\uD83E\uDDD4",g:"m",adv:0.5,hc:0.4,sp:0.5,meat:0.6,sweet:0.5,mods:[]},{id:"amanda",name:"Amanda",freq:"occasional",age:"adult",emoji:"\uD83D\uDC71\u200d\u2640\uFE0F",g:"f",adv:0.4,hc:0.45,sp:0.35,meat:0.5,sweet:0.55,mods:[]}];

var RESTS=[{id:"chick-fil-a",name:"Chick-fil-A",cat:"fast-food",emoji:"🐔",hs:0.50,cs:0.75,ts:0.30,ks:0.95,gs:0.85,ls:0.30,rs:0.95,ss:0.60,bl:2,sl:1,fav:true,bo:false,to:207,to90:4,to365:15,lo:27,ld:"2026-02-23",fd:"2019-06-03",acS:20,acC:40,acF:55,acG:155,streak:2,cw:1.0,tags:["Toddler Compatible","Crowd Pleaser","Proven Reliable"],notes:"187 lifetime orders. Nuggets solve everything.",orders:[{id:"cfa-bs",title:"CFA Breakfast Solo",items:["Chicken Biscuit Meal","Coffee"],sc:"solo",ml:"breakfast",price:10,kf:false,note:"The breakfast default."},{id:"cfa-bc",title:"CFA Breakfast Duo",items:["Chicken Biscuit Meal","Egg White Grill Meal","Hash Brown Scramble"],sc:"couple",ml:"breakfast",price:25,kf:true,note:"Morning fuel."},{id:"cfa-s",title:"Cobb Salad Solo",items:["Cobb Salad","Sunjoy"],sc:"solo",ml:"lunch",price:15,kf:false,note:"The responsible order."},{id:"cfa-cl",title:"CFA Lunch Duo",items:["Cobb Salad","Spicy Deluxe Sandwich","Sunjoy"],sc:"couple",ml:"lunch",price:30},{id:"cfa-c",title:"Kevin + Jenna Classic",items:["Sandwich Meal","Cobb Salad","Sunjoy"],sc:"couple",ml:"dinner",price:30,kf:false,note:"Sandwich Meal + Cobb Salad. Always."},{id:"cfa-f",title:"Family Nugget Treaty",items:["Sandwich Meal","Spicy Sandwich","5ct Nuggets Kid Meal x2","Frosty Lemonade"],sc:"family",price:45,kf:true,note:"The ceasefire agreement."},{id:"cfa-g",title:"CFA Group Kit",items:["Nugget Tray","Sandwich Meals x3","Kid Meals x2","Gallon Lemonade"],sc:"group",price:90,kf:true,note:"Nuclear peace option."}],ctx:[]},{id:"wawa",name:"Wawa",cat:"breakfast",emoji:"🥯",hs:0.30,cs:0.60,ts:0.80,ks:0.70,gs:0.50,ls:0.10,rs:0.80,ss:0.50,bl:1,sl:1,fav:true,bo:false,to:89,to90:2,to365:16,lo:73,ld:"2026-01-08",fd:"2021-05-15",acS:25,acC:40,acF:50,streak:0,cw:0.9,tags:["Kid-Safe","Proven Reliable","Treat Protocol"],notes:"85 lifetime orders. Boston Cream Donuts are a household constant.",orders:[{id:"wa-s",title:"Solo Donut Run",items:["Boston Cream Donut x2","Glazed Donut","Coffee"],sc:"solo",ml:"breakfast",price:10,kf:false,note:"The donut lifeline."},{id:"wa-c",title:"Donut + Breakfast Duo",items:["Boston Cream x2","Glazed x2","Cornbread","Coffee x2"],sc:"couple",ml:"breakfast",price:25,kf:true,note:"Breakfast of champions."},{id:"wa-f",title:"Wawa Family Spread",items:["Mini Donut Variety 4-Pack","Boston Cream x3","Egg Sandwich x2","Cornbread"],sc:"family",ml:"breakfast",price:35,kf:true,note:"Donuts keep the peace."},{id:"wa-t",title:"Treat Run",items:["Boston Cream x4","Glazed x4","Chocolate Frosted x2","Strawberry Frosted x2"],sc:"treat",price:20,kf:true,note:"Pure donut energy."}],ctx:[]},{id:"cantina",name:"Cantina Mexican Grill",sn:"Cantina Mexican",spicy:"optional",cat:"mexican",emoji:"🇲🇽",hs:0.40,cs:0.75,ts:0.40,ks:0.60,gs:0.90,ls:0.60,rs:0.80,ss:0.90,bl:3,sl:2,fav:true,bo:false,to:51,to90:1,to365:7,lo:61,ld:"2026-01-20",fd:"2021-06-25",acS:25,acC:50,acF:70,acG:115,streak:0,cw:0.8,tags:["Crowd Pleaser","Group-Safe","Best for Leftovers"],notes:"48 lifetime orders. Tres Leches and Shrimp Fajitas are the anchors.",orders:[{id:"can-c",title:"Fajita Night",items:["Shrimp Fajitas","Quesadilla","Tres Leches"],sc:"couple",ml:"dinner",price:45,kf:true,note:"Fajitas + Tres Leches. Non-negotiable."},{id:"can-g",title:"Cantina Family Spread",items:["Shrimp Fajitas","Chicken & Steak Fajitas","Quesadillas x2","Tacos x4","Churros","Tres Leches"],sc:"group",price:90,kf:true,note:"Feed the whole crew. Leftovers guaranteed."}],ctx:[]},{id:"arbys",name:"Arby's",cat:"fast-food",emoji:"🎩",hs:0.35,cs:0.70,ts:0.20,ks:0.60,gs:0.60,ls:0.20,rs:0.75,ss:0.40,bl:2,sl:1,fav:false,bo:false,to:45,to90:0,to365:6,lo:143,ld:"2025-10-30",fd:"2021-11-11",acS:25,acC:40,acF:55,acG:85,streak:0,cw:0.7,tags:["Proven Reliable","Cheap & Easy"],notes:"45 lifetime orders. Turkey Ranch & Bacon is the go-to.",orders:[{id:"arb-s",title:"Solo Turkey Ranch",items:["Roast Turkey Ranch & Bacon"],sc:"solo",price:15,kf:false,note:"The reliable Arby's order."},{id:"arb-f",title:"Arby's Family Bag",items:["Turkey Ranch & Bacon x2","Kids Meal x2","Smokehouse Brisket"],sc:"family",price:35,kf:true,note:"Turkey Ranch for adults, kids meals for kids."}],ctx:[]},{id:"fresh-kitchen",name:"Fresh Kitchen",cat:"healthy",emoji:"🥗",hs:0.90,cs:0.40,ts:0.20,ks:0.50,gs:0.50,ls:0.40,rs:0.95,ss:0.30,bl:2,sl:2,fav:true,bo:false,to:42,to90:11,to365:28,lo:4,ld:"2026-03-18",fd:"2021-12-19",acS:25,acC:45,acF:60,acG:80,streak:5,cw:1.3,tags:["Healthy Hero","Proven Reliable"],notes:"41 lifetime orders. Three Bowl is a household institution. Currently on a streak.",orders:[{id:"fk-s",title:"Three Bowl Solo",items:["Three Bowl"],sc:"solo",price:15,kf:false,note:"The usual."},{id:"fk-c",title:"Double Bowl Night",items:["Three Bowl","Four Bowl"],sc:"couple",price:30,kf:false,note:"Two bowls, shared contentment."},{id:"fk-f",title:"Bowl Family",items:["Three Bowl x2","Kids Bowl","Really Good Cookies"],sc:"family",price:40,kf:true,note:"Cookies are the kid bribe."}],ctx:[]},{id:"chilis",name:"Chili's",cat:"casual-dining",emoji:"🌶️",hs:0.40,cs:0.75,ts:0.35,ks:0.60,gs:0.70,ls:0.50,rs:0.75,ss:0.60,bl:2,sl:2,fav:false,bo:false,to:38,to90:0,to365:2,lo:229,ld:"2025-08-05",fd:"2019-12-18",acS:25,acC:45,acF:65,acG:80,streak:0,cw:0.6,tags:["Crowd Pleaser","Viable Path"],notes:"34 lifetime orders. Margarita Grilled Chicken is the staple.",orders:[{id:"chi-c",title:"Chili's Date Night",items:["Margarita Grilled Chicken","Crispy Chicken Crispers","Dip Trio"],sc:"couple",price:40,kf:false,note:"Solid casual dining."},{id:"chi-g",title:"Chili's Group",items:["Margarita Grilled Chicken x2","Triple Dipper","Crispers","Molten Chocolate Cake"],sc:"group",price:65,kf:true,note:"Big shareable order."}],ctx:[]},{id:"panera",name:"Panera Bread",cat:"fast-casual",emoji:"🍞",hs:0.65,cs:0.65,ts:0.40,ks:0.80,gs:0.70,ls:0.30,rs:0.85,ss:0.50,bl:2,sl:2,fav:true,bo:false,to:32,to90:5,to365:9,lo:3,ld:"2026-03-19",fd:"2021-12-26",acS:30,acC:40,acF:50,acG:90,streak:2,cw:1.0,tags:["Low Veto Risk","Kid-Safe","Surprisingly Sensible"],notes:"31 lifetime orders. Sandwich and Soup/Mac is the default. Kids Mac is the kid anchor.",orders:[{id:"pan-bs",title:"Morning You Pick Two",items:["Bacon Egg & Cheese on Ciabatta","Coffee"],sc:"solo",ml:"breakfast",price:15,kf:false,note:"The responsible morning."},{id:"pan-s",title:"Solo You Pick Two",items:["Sandwich and Soup/Mac","Cookie"],sc:"solo",price:20,kf:false,note:"Responsible and satisfying."},{id:"pan-c",title:"Classic Panera Run",items:["Sandwich and Soup/Mac x2","Brownie Bites","Fuji Apple Cranberry"],sc:"couple",ml:"lunch",price:40,kf:true,note:"Brownie Bites are non-negotiable."},{id:"pan-f",title:"Panera Family",items:["Sandwich and Soup/Mac x2","Kids Mac & Cheese","Kids Grilled Cheese","Brownie Bites","Cookie"],sc:"family",price:55,kf:true,note:"Mac & Cheese keeps kids docile."}],ctx:[]},{id:"crumbl",name:"Crumbl Cookies",cat:"dessert",emoji:"🍪",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.60,ls:0.20,rs:0.75,ss:0.70,bl:2,sl:2,fav:false,bo:false,to:32,to90:0,to365:0,lo:552,ld:"2024-09-16",fd:"2022-04-13",acS:30,acC:40,streak:0,cw:0.5,tags:["Treat Protocol","Sweet Tooth Emergency"],notes:"34 lifetime orders. 6-Pack is the standard. Currently in cooldown.",orders:[{id:"cr-t",title:"Crumbl 6-Pack",items:["6-Pack"],sc:"treat",price:30,kf:true,note:"The standard Crumbl run."},{id:"cr-f",title:"Crumbl Family Night",items:["6-Pack","4-Pack"],sc:"family",price:40,kf:true,note:"Everyone gets a cookie. Or three."}],ctx:[]},{id:"tropical-smoothie",name:"Tropical Smoothie",sn:"Tropical Smoothie",cat:"healthy",emoji:"🥤",hs:0.70,cs:0.40,ts:0.70,ks:0.80,gs:0.50,ls:0.10,rs:0.80,ss:0.40,bl:2,sl:2,fav:false,bo:false,to:28,to90:2,to365:3,lo:38,ld:"2026-02-12",fd:"2022-04-24",acS:25,acC:30,acF:45,streak:0,cw:0.7,tags:["Sweet Tooth Emergency","Healthy Hero","Kid-Safe"],notes:"28 lifetime orders. Peanut Butter Cup and Bahama Mama are the go-tos.",orders:[{id:"ts-c",title:"Smoothie Duo",items:["Peanut Butter Cup","Bahama Mama","Cookie"],sc:"couple",price:25,kf:true,note:"Light dinner + treat vibes."},{id:"ts-f",title:"Smoothie Family Run",items:["Peanut Butter Cup","Sunrise Sunset","Jetty Junior x2","Cookies"],sc:"family",price:40,kf:true,note:"Kids think smoothies are milkshakes."}],ctx:[{when:"always",w:6,label:"Default smoothie choice"}]},{id:"red-robin",name:"Red Robin",sn:"Red Robin",cat:"casual-dining",emoji:"🐦",hs:0.30,cs:0.80,ts:0.30,ks:0.70,gs:0.70,ls:0.40,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:31,to90:0,to365:0,lo:806,ld:"2024-01-06",fd:"2021-07-04",acS:20,acC:40,acF:55,streak:0,cw:0.4,tags:["Comfort Path","Kid-Safe"],notes:"28 lifetime orders but dormant 2+ years. Haystack Double was the usual.",orders:[{id:"rr-c",title:"Haystack Night",items:["Haystack Tavern Double x2","Pretzel Bites"],sc:"couple",price:40,kf:false,note:"The old reliable."},{id:"rr-f",title:"Red Robin Family",items:["Haystack Double","Chicken Tenders","Clucks & Fries x2","Pretzel Bites"],sc:"family",price:50,kf:true,note:"Bottomless fries energy."}],ctx:[]},{id:"jersey-mikes",name:"Jersey Mike's",cat:"subs",emoji:"🥖",hs:0.45,cs:0.70,ts:0.20,ks:0.60,gs:0.80,ls:0.30,rs:0.90,ss:0.40,bl:2,sl:2,fav:true,bo:false,to:24,to90:8,to365:18,lo:6,ld:"2026-03-16",fd:"2022-07-07",acS:20,acC:40,acF:60,acG:85,streak:3,cw:1.0,tags:["Proven Reliable","Group-Safe","Crowd Pleaser"],notes:"24 lifetime orders. #7 Turkey and Provolone is a personality trait. Currently hot.",orders:[{id:"jm-s",title:"Solo #7",items:["#7 Turkey & Provolone","Chips"],sc:"solo",ml:"lunch",price:20,kf:true,note:"Efficient."},{id:"jm-c",title:"Double #7 Lunch",items:["#7 Turkey & Provolone x2","Chips","Cookie"],sc:"couple",ml:"lunch",price:35,kf:true,note:"Reliable Tuesday energy."},{id:"jm-g",title:"Sub Spread",items:["#7 x3","#43 Chipotle Cheese Steak","Chips x3","Cookies x2"],sc:"group",price:60,kf:true,note:"Group logistics: manageable."}],ctx:[{when:"female",w:6,label:"Household lunch staple"},{when:"kids",w:6,label:"Household lunch staple"}]},{id:"culvers",name:"Culver's",cat:"fast-food",emoji:"🧈",hs:0.30,cs:0.80,ts:0.40,ks:0.80,gs:0.70,ls:0.30,rs:0.80,ss:0.50,bl:2,sl:1,fav:false,bo:false,to:22,to90:1,to365:4,lo:68,ld:"2026-01-13",fd:"2023-12-16",acC:45,acF:55,acG:85,streak:0,cw:0.7,tags:["Kid-Safe","Comfort Path","Crowd Pleaser"],notes:"22 lifetime orders. Chicken Tenders and ButterBurgers. Concrete Mixers are the real draw.",orders:[{id:"cul-c",title:"ButterBurger Night",items:["ButterBurger Cheese Value Basket x2","Concrete Mixer"],sc:"couple",ml:"dinner",price:35,kf:true,note:"The Concrete Mixer is non-negotiable."},{id:"cul-f",title:"Culver's Family",items:["ButterBurger Cheese Basket","Chicken Tenders Basket","Kids Tenders Meal","Kids Grilled Cheese","Concrete Mixer"],sc:"family",price:50,kf:true,note:"Everyone wins at Culver's."}],ctx:[{when:"kids",w:10,label:"Family burger pick"}]},{id:"five-guys",name:"Five Guys",cat:"burgers",emoji:"🍔",hs:0.15,cs:0.90,ts:0.40,ks:0.60,gs:0.60,ls:0.20,rs:0.80,ss:0.50,bl:3,sl:2,fav:false,bo:false,to:21,to90:2,to365:5,lo:6,ld:"2026-03-16",fd:"2022-05-01",acS:30,acC:40,acF:50,streak:1,cw:0.7,tags:["Comfort Path","Viable Path"],notes:"22 lifetime orders. Cheeseburger + Fries. Expensive but worth it.",orders:[{id:"fg-c",title:"Burger Night",items:["Cheeseburger x2","Regular Cajun Fries"],sc:"couple",ml:"dinner",price:40,kf:true,note:"One large fry feeds a village."},{id:"fg-f",title:"Five Guys Family",items:["Cheeseburger x2","Little Hamburger","Little Fries","Milkshake"],sc:"family",price:55,kf:true,note:"Don't do the math."}],ctx:[{when:"kids",w:-15,label:"Expensive for kids"},{when:"couple",w:8,label:"Premium date pick"}]},{id:"mcdonalds",name:"McDonald's",cat:"fast-food",emoji:"🍟",hs:0.20,cs:0.75,ts:0.40,ks:0.85,gs:0.70,ls:0.20,rs:0.75,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:21,to90:1,to365:5,lo:13,ld:"2026-03-09",fd:"2021-08-26",acS:20,acC:45,acF:55,acG:60,streak:0,cw:0.7,tags:["Kid-Safe","Cheap & Easy"],notes:"20 lifetime orders. Happy Meals are the kid anchor. McCrispy for adults.",orders:[{id:"mc-b",title:"McD Breakfast",items:["Egg McMuffin Meal","Sausage McGriddle Meal","Hash Browns"],sc:"couple",ml:"breakfast",price:25,kf:false,note:"The classic morning run."},{id:"mc-bf",title:"McD Family Breakfast",items:["Egg McMuffin Meal","McGriddle Meal","Hotcakes Happy Meal x2"],sc:"family",ml:"breakfast",price:35,kf:true,note:"Pancakes keep the kids happy."},{id:"mc-c",title:"McCrispy Night",items:["Deluxe McCrispy Meal","Quarter Pounder Meal","McFlurry"],sc:"couple",ml:"dinner",price:30,kf:false,note:"Fast and reliable."},{id:"mc-ln",title:"Late Night McD",items:["Double Quarter Pounder Meal","McNuggets 10pc","McFlurry"],sc:"solo",ml:"latenight",price:25},{id:"mc-f",title:"McDonald's Family Run",items:["McCrispy Meal","QPC Meal","Hamburger Happy Meal x2","McNuggets 10pc"],sc:"family",ml:"dinner",price:45,kf:true,note:"Happy Meals keep the peace."}],ctx:[]},{id:"wendys",name:"Wendy's",cat:"fast-food",emoji:"🟧",hs:0.30,cs:0.70,ts:0.40,ks:0.65,gs:0.65,ls:0.20,rs:0.75,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:17,to90:1,to365:5,lo:23,ld:"2026-02-27",fd:"2021-08-09",acS:25,acC:45,acF:55,acG:75,streak:0,cw:0.5,tags:["Cheap & Easy","Surprisingly Sensible"],notes:"17 lifetime orders. Dave's Combo + Frosty is the standard.",orders:[{id:"wen-c",title:"Dave's Night Out",items:["Dave's Combo x2","Frosty"],sc:"couple",ml:"dinner",price:25,kf:true,note:"No drama."},{id:"wen-f",title:"Wendy's Family",items:["Dave's Combo x2","Kids Nuggets","Frosty x2"],sc:"family",price:40,kf:true,note:"Frosty does diplomatic work."}],ctx:[]},{id:"dunkin",name:"Dunkin'",cat:"coffee-snack",emoji:"☕",hs:0.10,cs:0.50,ts:0.85,ks:0.75,gs:0.50,ls:0.10,rs:0.75,ss:0.60,bl:1,sl:1,fav:false,bo:false,to:16,to90:2,to365:5,lo:15,ld:"2026-03-07",fd:"2022-07-30",acS:30,acC:40,streak:0,cw:0.5,tags:["Sweet Tooth Emergency","Cheap & Easy","Kid-Safe"],notes:"16 lifetime orders. Dozen Donuts and Munchkins are the move.",orders:[{id:"dk-s",title:"Solo Coffee + Donuts",items:["Iced Coffee","Half Dozen Donuts"],sc:"solo",price:10,kf:false,note:"The lifeline."},{id:"dk-t",title:"Donut Run",items:["Dozen Donuts","Munchkins","Iced Coffee x2"],sc:"treat",price:25,kf:true,note:"Own it."},{id:"dk-b",title:"Breakfast Run",items:["Sourdough Breakfast Sandwich x2","Iced Coffee x2","Munchkins"],sc:"couple",ml:"breakfast",price:25,kf:false,note:"Morning fuel."}],ctx:[]},{id:"steak-n-shake",name:"Steak 'n Shake",sn:"Steak 'n Shake",cat:"burgers",emoji:"🥛",hs:0.15,cs:0.85,ts:0.60,ks:0.70,gs:0.50,ls:0.10,rs:0.70,ss:0.40,bl:1,sl:2,fav:false,bo:false,to:15,to90:1,to365:2,lo:14,ld:"2026-03-08",fd:"2021-02-02",acS:25,acC:40,streak:0,cw:0.5,tags:["Comfort Path","Stable Output","Cheap & Easy"],notes:"15 lifetime orders. Frisco Melt Combo is the default.",orders:[{id:"sns-c",title:"Frisco Melt Night",items:["Frisco Melt Combo x2","Milkshake"],sc:"couple",ml:"latenight",price:20,kf:true,note:"The Frisco Melt carries."}],ctx:[]},{id:"taco-bell",name:"Taco Bell",spicy:"optional",cat:"fast-food",emoji:"🌮",hs:0.15,cs:0.90,ts:0.50,ks:0.50,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:14,to90:2,to365:7,lo:16,ld:"2026-03-06",fd:"2022-07-29",acS:25,acC:45,acF:70,streak:1,cw:0.9,tags:["Comfort Override","Cheap & Easy","Stable Output"],notes:"14 lifetime orders. Gordita Crunch + Beefy 5-Layer + Nacho Fries.",orders:[{id:"tb-bs",title:"AM Crunchwrap Run",items:["Breakfast Crunchwrap","Cinnabon Delights 4-Pack","Mountain Dew Baja Blast"],sc:"solo",ml:"breakfast",price:15,kf:false,note:"The guilty morning."},{id:"tb-s",title:"Solo Run",items:["Cheesy Gordita Crunch","Beefy 5-Layer Burrito","Nacho Fries"],sc:"solo",price:15,kf:false,note:"Between you and God."},{id:"tb-c",title:"Full Spread",items:["Gordita Crunch x2","Doritos Locos Tacos x2","Beefy 5-Layer","Nacho Fries","Cinnabon Delights"],sc:"couple",ml:"dinner",price:30,kf:false,note:"No regrets."},{id:"tb-f",title:"Family Chaos",items:["Gordita Crunch","Burrito","Quesadilla","Soft Tacos x4","Cheesy Fiesta Potatoes"],sc:"family",price:35,kf:true,note:"Soft tacos: the kid gateway."}],ctx:[]},{id:"chipotle",name:"Chipotle",spicy:"optional",cat:"fast-casual",emoji:"🌯",hs:0.60,cs:0.60,ts:0.20,ks:0.50,gs:0.65,ls:0.50,rs:0.80,ss:0.40,bl:2,sl:2,fav:false,bo:false,to:27,to90:2,to365:5,lo:12,ld:"2026-03-10",fd:"2019-05-05",acS:25,acC:35,acF:50,streak:0,cw:0.6,tags:["Surprisingly Sensible","Proven Reliable"],notes:"24 lifetime orders. Burrito Bowl is the constant. Kids Quesadilla for the little ones.",orders:[{id:"ch-s",title:"Solo Bowl",items:["Burrito Bowl","Chips & Queso Blanco"],sc:"solo",price:20,kf:false,note:"Customize everything."},{id:"ch-c",title:"Bowl Night",items:["Burrito Bowl x2","Chips & Queso Blanco","Tortilla on Side"],sc:"couple",price:35,kf:false,note:"Double bowls."},{id:"ch-f",title:"Chipotle Family",items:["Burrito Bowl x2","Kids Quesadilla x2","Chips & Guac"],sc:"family",price:45,kf:true,note:"Quesadillas keep kids in line."}],ctx:[]},{id:"new-china",name:"New China",cat:"asian",emoji:"🥡",hs:0.35,cs:0.80,ts:0.30,ks:0.55,gs:0.85,ls:0.80,rs:0.70,ss:0.90,bl:2,sl:2,fav:false,bo:false,to:5,to90:2,to365:4,lo:22,ld:"2026-02-28",fd:"2024-11-06",acS:20,acF:65,streak:0,cw:0.5,tags:["Group-Safe","Crowd Pleaser","Best for Leftovers"],notes:"5 orders but active recently. Sesame Chicken + Crab Rangoon + Lo Mein.",orders:[{id:"nc-c",title:"Chinese Date Night",items:["Sesame Chicken","Crab Rangoon","Lo Mein"],sc:"couple",price:35,kf:false,note:"Sharing containers."},{id:"nc-f",title:"Chinese Family Spread",items:["Sesame Chicken","Sweet & Sour Chicken","Crab Rangoon","Lo Mein","French Fries"],sc:"family",price:50,kf:true,note:"Leftovers for days."},{id:"nc-g",title:"Chinese Feast",items:["Sesame Chicken","Sweet & Sour Chicken","Crab Rangoon x2","Lo Mein","Fried Rice","Egg Rolls"],sc:"group",price:70,kf:true,note:"The round table of takeout."}],ctx:[]},{id:"ice-sssscreamin",name:"Ice Sssscreamin",sn:"Ice Sssscreamin",cat:"dessert",emoji:"🍫",hs:0.05,cs:0.70,ts:0.95,ks:0.80,gs:0.60,ls:0.10,rs:0.70,ss:0.60,bl:2,sl:2,fav:false,bo:false,to:4,to90:1,to365:2,lo:11,ld:"2026-03-11",fd:"2022-01-20",acS:20,acC:45,acF:60,streak:0,cw:0.5,tags:["Sweet Tooth Emergency","Treat Protocol"],notes:"4 orders, active recently. Brownie Sundae is the go-to.",orders:[{id:"ice-t",title:"Brownie Sundae Run",items:["Brownie Sundae","Oreo Sundae"],sc:"treat",price:25,kf:true,note:"Dessert is dinner if you believe."},{id:"ice-f",title:"Family Treat Night",items:["Brownie Sundae","Oreo Sundae","Apple Pie"],sc:"family",price:35,kf:true,note:"Nobody pretend this is a meal."}],ctx:[]},{id:"outback",name:"Outback Steakhouse",sn:"Outback",cat:"casual-dining",emoji:"🇦🇺",hs:0.35,cs:0.80,ts:0.35,ks:0.50,gs:0.70,ls:0.50,rs:0.70,ss:0.50,bl:3,sl:2,fav:false,bo:false,to:16,to90:0,to365:0,lo:568,ld:"2024-08-31",fd:"2022-03-31",acC:45,acF:70,acG:80,streak:0,cw:0.4,tags:["Comfort Path","Viable Path"],notes:"15 lifetime orders but dormant 1.5 years. Prime Rib Sandwich + Alice Springs Chicken.",orders:[{id:"ob-c",title:"Outback Date Night",items:["Prime Rib Sandwich","Alice Springs Chicken","Carrot Cake"],sc:"couple",price:55,kf:false,note:"Big treat night."},{id:"ob-g",title:"Outback Group",items:["Alice Springs x2","Prime Rib Sandwich","Mac A Roo N Cheese x2","Butter Cake"],sc:"group",price:80,kf:true,note:"Special occasion vibes."}],ctx:[]},{id:"bjs",name:"BJ's Restaurant",sn:"BJ's Restaurant",cat:"casual-dining",emoji:"🎱",hs:0.40,cs:0.70,ts:0.50,ks:0.60,gs:0.70,ls:0.50,rs:0.70,ss:0.60,bl:3,sl:2,fav:false,bo:false,to:15,to90:0,to365:0,lo:518,ld:"2024-10-20",fd:"2019-06-01",acS:25,acC:45,acF:60,streak:0,cw:0.4,tags:["Crowd Pleaser","Viable Path"],notes:"12 lifetime orders. Grilled Chicken Alfredo + Pizookie Trio is the order.",orders:[{id:"bj-c",title:"BJ's Night",items:["Grilled Chicken Alfredo","Mahi Tacos","Pizookie Trio"],sc:"couple",price:50,kf:false,note:"Alfredo + Pizookie is the move."},{id:"bj-g",title:"BJ's Group Night",items:["Chicken Alfredo x2","California Club","Pizookie Trio x2"],sc:"group",price:75,kf:true,note:"Pizookies for everyone."}],ctx:[]},{id:"subway",name:"Subway",cat:"subs",emoji:"🚇",hs:0.45,cs:0.65,ts:0.20,ks:0.60,gs:0.70,ls:0.20,rs:0.75,ss:0.40,bl:1,sl:1,fav:false,bo:false,to:16,to90:0,to365:1,lo:249,ld:"2025-07-16",fd:"2021-08-29",acS:20,acC:40,streak:0,cw:0.5,tags:["Dinner Spot","Established"],notes:"16 lifetime orders.",orders:[{id:"subway-d",title:"Default Order",items:["Steak & Cheese Footlong Regular Sub","Raspberry Cheesecake","White Chip Macadamia Nut"],sc:"couple",price:45,kf:false,note:"The usual."}],ctx:[{when:"female",w:-10,label:"Kevin solo spot"},{when:"kids",w:-10,label:"Kevin solo spot"}]},{id:"carrabbas",name:"Carrabba's Italian Grill",sn:"Carrabba's Italian",cat:"italian",emoji:"🍝",hs:0.40,cs:0.80,ts:0.35,ks:0.50,gs:0.75,ls:0.60,rs:0.70,ss:0.60,bl:3,sl:2,fav:false,bo:false,to:10,to90:0,to365:0,lo:960,ld:"2023-08-05",fd:"2021-10-27",acC:45,acF:70,acG:130,streak:0,cw:0.5,tags:["Dinner Spot","Established"],notes:"10 lifetime orders.",orders:[{id:"carrabbas-d",title:"Default Order",items:["Spaghetti","Carrabba's Italian Classics Trio","Strawberry Cheesecake"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"dickeys",name:"Dickey's Barbecue Pit",sn:"Dickey's BBQ",cat:"bbq",emoji:"🍖",hs:0.25,cs:0.85,ts:0.25,ks:0.60,gs:0.80,ls:0.60,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:8,to90:0,to365:1,lo:254,ld:"2025-07-11",fd:"2023-01-12",acS:35,acF:65,streak:0,cw:0.5,tags:["Dinner Spot","Established"],notes:"8 lifetime orders.",orders:[{id:"dickeys-d",title:"Default Order",items:["Pecan Pie","2 Meat Plate","Mac & Cheese"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[]},{id:"minerva",name:"Minerva Indian",spicy:true,cat:"indian",emoji:"🍛",hs:0.50,cs:0.70,ts:0.20,ks:0.30,gs:0.75,ls:0.70,rs:0.45,ss:0.70,bl:2,sl:2,fav:false,bo:false,to:7,to90:0,to365:1,lo:210,ld:"2025-08-24",fd:"2021-04-02",acC:50,acF:65,streak:0,cw:0.5,tags:["Dinner Spot","Established"],notes:"7 lifetime orders.",orders:[{id:"minerva-d",title:"Default Order",items:["Chicken Tikka Masala","Garlic Naan (**2)","Gulab Jamun (** 2 )(3Pcs)"],sc:"couple",price:45,kf:false,note:"The usual."}],ctx:[{when:"always",w:-5,label:"Inconsistent quality"}]},{id:"kekes",name:"Keke's Breakfast Cafe",sn:"Keke's Breakfast",cat:"breakfast",emoji:"🌅",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.75,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:7,to90:0,to365:1,lo:354,ld:"2025-04-02",fd:"2022-12-19",acC:50,acF:50,streak:0,cw:0.5,tags:["Breakfast Spot","Established"],notes:"7 lifetime orders.",orders:[{id:"kekes-d",title:"Default Order",items:["Buttermilk Pancakes","Pina Colada Stuffed French Toast","Silver Dollar Pancakes."],sc:"couple",price:55,kf:false,note:"The usual."}],ctx:[{when:"group",w:6,label:"Premium breakfast"}]},{id:"sweetfrog",name:"sweetFrog",cat:"dessert",emoji:"🐸",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:7,to90:0,to365:1,lo:357,ld:"2025-03-30",fd:"2025-01-04",acS:20,acC:35,acF:40,streak:0,cw:0.5,tags:["Dinner Spot","Treat Protocol","Established"],notes:"7 lifetime orders.",orders:[{id:"sweetfrog-d",title:"Default Order",items:["Cookies & Cream","Cake Batter","Vanilla"],sc:"couple",price:40,kf:false,note:"The usual."}],ctx:[]},{id:"wingstop",name:"Wingstop",spicy:"optional",cat:"wings",emoji:"🍗",hs:0.20,cs:0.80,ts:0.30,ks:0.50,gs:0.70,ls:0.30,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:7,to90:0,to365:0,lo:409,ld:"2025-02-06",fd:"2023-02-13",acS:20,acC:40,streak:0,cw:0.5,tags:["Dinner Spot","Late Night","Established"],notes:"7 lifetime orders.",orders:[{id:"wingstop-d",title:"Default Order",items:["Large 10 pc Wing Combo","Small 3 pc Crispy Tender Combo","Small 6 pc Wing Combo"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"brunchery",name:"Brunchery",cat:"breakfast",emoji:"🧇",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.75,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:7,to90:0,to365:0,lo:1526,ld:"2022-01-16",fd:"2021-09-16",acS:30,acC:40,acF:60,streak:0,cw:0.5,tags:["Breakfast Spot","Established"],notes:"7 lifetime orders.",orders:[{id:"brunchery-d",title:"Default Order",items:["Feature","Biscuits & Gravy","Triple 222"],sc:"couple",price:50,kf:false,note:"The usual."}],ctx:[{when:"always",w:-8,label:"Low priority"}]},{id:"cali",name:"CALI",cat:"healthy",emoji:"🌴",hs:0.80,cs:0.40,ts:0.30,ks:0.50,gs:0.50,ls:0.20,rs:0.70,ss:0.40,bl:2,sl:2,fav:false,bo:false,to:6,to90:0,to365:0,lo:537,ld:"2024-10-01",fd:"2021-07-07",acC:40,streak:0,cw:0.5,tags:["Dinner Spot","Healthy Hero"],notes:"6 lifetime orders.",orders:[{id:"cali-d",title:"Default Order",items:["Spicy Brazilian - GF","Basic Wrap","S'mores Cookie"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"hyderabad-biryani",name:"Hyderabad Biryani House",sn:"Hyderabad Biryani",spicy:true,cat:"indian",emoji:"🍚",hs:0.50,cs:0.75,ts:0.25,ks:0.30,gs:0.75,ls:0.70,rs:0.80,ss:0.70,bl:2,sl:2,fav:false,bo:false,to:5,to90:0,to365:0,lo:511,ld:"2024-10-27",fd:"2024-01-15",acC:50,acF:70,streak:0,cw:0.5,tags:["Dinner Spot","Late Night"],notes:"5 lifetime orders.",orders:[{id:"hyderabad-biryani-d",title:"Default Order",items:["Butter Chicken","Garlic Naan","Plain Basmati Rice 12 oz"],sc:"couple",price:40,kf:false,note:"The usual."}],ctx:[{when:"always",w:6,label:"Better quality"}]},{id:"ho-king",name:"Ho King",cat:"asian",emoji:"🥠",hs:0.35,cs:0.75,ts:0.25,ks:0.50,gs:0.80,ls:0.70,rs:0.65,ss:0.80,bl:2,sl:2,fav:false,bo:false,to:4,to90:0,to365:0,lo:406,ld:"2025-02-09",fd:"2022-12-24",acS:25,acF:70,streak:0,cw:0.5,tags:["Dinner Spot"],notes:"4 lifetime orders.",orders:[{id:"ho-king-d",title:"Default Order",items:["Sweet & Sour Chicken or Pork (Large)","Chicken or Roast Pork Lo Mein","Egg Roll or Vegetable Roll (1 Pc)"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[]},{id:"twistee-treat",name:"Twistee Treat",cat:"dessert",emoji:"🍦",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:4,to90:0,to365:0,lo:1074,ld:"2023-04-13",fd:"2022-03-04",acS:15,acC:30,streak:0,cw:0.5,tags:["Dinner Spot","Treat Protocol"],notes:"4 lifetime orders.",orders:[{id:"twistee-treat-d",title:"Default Order",items:["Brownie Quart","Reese's Peanut Butter Cup Quart","Vanilla Quart"],sc:"couple",price:30,kf:false,note:"The usual."}],ctx:[{when:"always",w:-5,label:"Very specific craving"}]},{id:"krispy-kreme",name:"Krispy Kreme",cat:"breakfast",emoji:"🍩",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.75,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:3,lo:147,ld:"2025-10-26",fd:"2025-07-13",acS:30,acC:35,streak:0,cw:0.5,tags:["Breakfast Spot"],notes:"3 lifetime orders.",orders:[{id:"krispy-kreme-d",title:"Default Order",items:["Build Your Own Dozen","HALLOWEEN SPECIALTY DOZEN"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"panda-express",name:"Panda Express",sn:"Panda Express",cat:"asian",emoji:"🐼",hs:0.35,cs:0.75,ts:0.25,ks:0.50,gs:0.80,ls:0.70,rs:0.65,ss:0.80,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:2,lo:148,ld:"2025-10-25",fd:"2025-02-28",acS:20,streak:0,cw:0.5,tags:["Late Night"],notes:"3 lifetime orders.",orders:[{id:"panda-express-d",title:"Default Order",items:["Plate","Bigger Plate"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[{when:"female",w:-8,label:"Kevin solo spot"},{when:"kids",w:-8,label:"Kevin solo spot"}]},{id:"daves-hot-chicken",name:"Dave's Hot Chicken",sn:"Dave's Hot Chicken",spicy:true,cat:"fast-food",emoji:"🔥",hs:0.20,cs:0.75,ts:0.40,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:3,to90:0,to365:3,lo:163,ld:"2025-10-10",fd:"2025-06-21",acS:25,acC:45,acF:45,streak:0,cw:0.5,tags:["Late Night"],notes:"3 lifetime orders.",orders:[{id:"daves-hot-chicken-d",title:"Default Order",items:["Dave's #4: 1 Slider with Fries","Mac & Cheese","Chocolate Shake"],sc:"couple",price:45,kf:false,note:"The usual."}],ctx:[]},{id:"pizza-hut",name:"Pizza Hut",cat:"pizza",emoji:"🍕",hs:0.25,cs:0.80,ts:0.30,ks:0.70,gs:0.80,ls:0.50,rs:0.75,ss:0.60,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:0,lo:379,ld:"2025-03-08",fd:"2022-10-28",acC:35,streak:0,cw:0.5,tags:["Dinner Spot"],notes:"3 lifetime orders.",orders:[{id:"pizza-hut-d",title:"Default Order",items:["Create Your Own Pizza","Roasted Garlic Cheese Sticks","14\" Meat Lover's Pizza"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"peach-cobbler",name:"Peach Cobbler Factory",sn:"Peach Cobbler",cat:"dessert",emoji:"🍑",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:0,lo:639,ld:"2024-06-21",fd:"2023-04-22",acC:35,acF:45,streak:0,cw:0.5,tags:["Dinner Spot","Late Night","Treat Protocol"],notes:"3 lifetime orders.",orders:[{id:"peach-cobbler-d",title:"Default Order",items:["VANILLA BUTTERFINGER COOKIE","DULCE DE LECHE CHURRO STIX","PEACH COBBLER MILKSHAKE"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"burger-king",name:"Burger King",sn:"Burger King",cat:"fast-food",emoji:"🤴",hs:0.20,cs:0.75,ts:0.40,ks:0.65,gs:0.60,ls:0.20,rs:0.40,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:3,to90:0,to365:0,lo:802,ld:"2024-01-10",fd:"2021-07-23",acS:20,streak:0,cw:0.5,tags:["Dinner Spot","Late Night"],notes:"3 lifetime orders.",orders:[{id:"burger-king-d",title:"Default Order",items:["Double Whopper® Meal","Hershey's® Sundae Pie","Bacon, Egg & Cheese Croissan'wich"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[{when:"always",w:-8,label:"Underwhelming history"},{when:"female",w:-5,label:"Not a Jenna pick"}]},{id:"checkers",name:"Checkers",spicy:"optional",cat:"fast-food",emoji:"🏁",hs:0.20,cs:0.75,ts:0.40,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:4,to90:0,to365:1,lo:189,ld:"2025-09-14",fd:"2022-02-11",acS:25,acC:40,acF:50,streak:0,cw:0.5,tags:["Dinner Spot","Late Night"],notes:"4 lifetime orders.",orders:[{id:"checkers-d",title:"Default Order",items:["Big Buford® Combo","Spicy Chicken Sandwich Combo","Chicken Bites Box Combo"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"planet-smoothie",name:"Planet Smoothie",sn:"Planet Smoothie",cat:"healthy",emoji:"🪐",hs:0.80,cs:0.40,ts:0.30,ks:0.50,gs:0.50,ls:0.20,rs:0.35,ss:0.40,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:0,lo:1003,ld:"2023-06-23",fd:"2023-02-03",acS:20,streak:0,cw:0.5,tags:["Breakfast Spot","Dinner Spot","Healthy Hero"],notes:"3 lifetime orders.",orders:[{id:"planet-smoothie-d",title:"Default Order",items:["Chocolate Elvis"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[{when:"always",w:-12,label:"Never order from here"}]},{id:"cold-stone",name:"Cold Stone Creamery",sn:"Cold Stone",cat:"dessert",emoji:"🍨",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:0,lo:1052,ld:"2023-05-05",fd:"2022-05-25",acC:30,streak:0,cw:0.5,tags:["Dinner Spot","Treat Protocol"],notes:"3 lifetime orders.",orders:[{id:"cold-stone-d",title:"Default Order",items:["Cake Batter Batter Batter™","Founder's Favorite®","Milk & OREO® Cookies"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[]},{id:"smoothie-king",name:"Smoothie King",sn:"Smoothie King",cat:"healthy",emoji:"🥝",hs:0.80,cs:0.40,ts:0.30,ks:0.50,gs:0.50,ls:0.20,rs:0.70,ss:0.40,bl:2,sl:2,fav:false,bo:false,to:3,to90:0,to365:0,lo:1400,ld:"2022-05-22",fd:"2022-04-23",acC:30,acF:40,streak:0,cw:0.5,tags:["Breakfast Spot","Healthy Hero"],notes:"3 lifetime orders.",orders:[{id:"smoothie-king-d",title:"Default Order",items:["Strawberry-Kiwi Breeze®","The Hulk™ Chocolate","Immune Builder® Orange"],sc:"couple",price:30,kf:false,note:"The usual."}],ctx:[{when:"mood-healthy",w:3,label:"Healthy mood only"},{when:"mood-other",w:-8,label:"Rare pick"}]},{id:"thai-ruby",name:"Thai Ruby",spicy:true,cat:"asian",emoji:"🍜",hs:0.45,cs:0.70,ts:0.20,ks:0.40,gs:0.75,ls:0.70,rs:0.70,ss:0.70,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:1,lo:261,ld:"2025-07-04",fd:"2024-11-24",acC:55,streak:0,cw:0.5,tags:["Dinner Spot"],notes:"2 lifetime orders. Family likes it.",orders:[{id:"thai-ruby-d",title:"Family Thai Night",items:["Chicken","Crab Rangoon","Thai Ruby Sampler"],sc:"family",price:55,kf:false,note:"The usual."}],ctx:[]},{id:"sonic",name:"Sonic",cat:"fast-food",emoji:"🚗",hs:0.20,cs:0.75,ts:0.40,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:4,to90:0,to365:0,lo:668,ld:"2024-05-23",fd:"2021-10-15",acC:30,streak:0,cw:0.5,tags:["Viable Path"],notes:"4 lifetime orders.",orders:[{id:"sonic-d",title:"Default Order",items:["Mozzarella Sticks","SONIC Blasts®","Tots"],sc:"couple",price:30,kf:false,note:"The usual."}],ctx:[{when:"latenight",w:4,label:"Late night option"}]},{id:"shake-shack",name:"Shake Shack",cat:"burgers",emoji:"🍟",hs:0.15,cs:0.85,ts:0.35,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:2,lo:219,ld:"2025-08-15",fd:"2025-07-22",acC:35,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"shake-shack-d",title:"Default Order",items:["SmokeShack","Black & White Shake","Bacon Cheese Fries"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[{when:"couple",w:8,label:"Premium burger date"},{when:"kids",w:-5,label:"Not great with kids"}]},{id:"cracker-barrel",name:"Cracker Barrel",sn:"Cracker Barrel",cat:"casual-dining",emoji:"🪵",hs:0.35,cs:0.75,ts:0.35,ks:0.55,gs:0.70,ls:0.50,rs:0.70,ss:0.55,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:0,lo:458,ld:"2024-12-19",fd:"2022-01-09",acC:25,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders. Also home of Pancake Kitchen virtual brand. Great for breakfast pancakes or comfort dinner.",orders:[{id:"cracker-barrel-d",title:"Default Order",items:["Sugar Plum Tea","Signature Fried Apple French Toast Bake","Fried Apples"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[{when:"kids",w:5,label:"Family comfort pick"},{when:"breakfast",w:5,label:"Great for breakfast"},{when:"brunch",w:5,label:"Great for brunch"}]},{id:"ihop",name:"IHOP",cat:"breakfast",emoji:"🥞",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:0,lo:500,ld:"2024-11-07",fd:"2022-01-23",acC:35,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"ihop-d",title:"Default Order",items:["Double Blueberry Pancakes","Hash Browns","Fruit Juices"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[{when:"breakfast",w:4,label:"Breakfast boost"},{when:"brunch",w:4,label:"Brunch boost"},{when:"kids",w:3,label:"Kids like pancakes"}]},{id:"chicken-salad-chick",name:"Chicken Salad Chick",sn:"Chicken Salad Chick",cat:"subs",emoji:"🥙",hs:0.45,cs:0.65,ts:0.20,ks:0.60,gs:0.70,ls:0.20,rs:0.70,ss:0.40,bl:1,sl:1,fav:false,bo:false,to:2,to90:0,to365:0,lo:548,ld:"2024-09-20",fd:"2023-06-23",acC:30,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"chicken-salad-chick-d",title:"Default Order",items:["Turkey Club","The Chick","Pina Colada Pie Slice"],sc:"couple",price:30,kf:false,note:"The usual."}],ctx:[{when:"female",w:3,label:"Women-friendly lunch"}]},{id:"insomnia-cookies",name:"Insomnia Cookies",sn:"Insomnia Cookies",cat:"dessert",emoji:"🌙",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:0,lo:569,ld:"2024-08-30",fd:"2023-09-14",acC:20,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"insomnia-cookies-d",title:"Default Order",items:["6-pack"],sc:"couple",price:20,kf:false,note:"The usual."}],ctx:[{when:"latenight",w:8,label:"Late night cookie delivery"}]},{id:"pdq",name:"PDQ",cat:"fast-food",emoji:"🐓",hs:0.20,cs:0.75,ts:0.40,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:1,sl:1,fav:false,bo:false,to:2,to90:0,to365:0,lo:795,ld:"2024-01-17",fd:"2023-05-08",acC:35,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"pdq-d",title:"Default Order",items:["Honey Butter Sandwich","Chocolate Cake Slice","Large Fries"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[]},{id:"cicis",name:"Cicis Pizza",cat:"pizza",emoji:"🍽️",hs:0.25,cs:0.80,ts:0.30,ks:0.70,gs:0.80,ls:0.50,rs:0.70,ss:0.60,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:1,lo:239,ld:"2025-07-26",fd:"2025-07-26",acC:25,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"cicis-d",title:"Default Order",items:["Hawaiian","Mac & Cheese"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[]},{id:"papa-johns",name:"Papa John's",cat:"pizza",emoji:"📦",hs:0.25,cs:0.80,ts:0.30,ks:0.70,gs:0.80,ls:0.50,rs:0.70,ss:0.60,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:1,lo:261,ld:"2025-07-04",fd:"2025-07-04",acC:25,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"papa-johns-d",title:"Default Order",items:["Super Hawaiian Pizza"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[]},{id:"hole-in-one-donut",name:"Hole In One Donuts",sn:"Hole In One Donuts",cat:"breakfast",emoji:"⛳",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:1,lo:266,ld:"2025-06-29",fd:"2025-06-29",acC:15,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"hole-in-one-donut-d",title:"Default Order",items:["Regular Donut","Filled Donuts"],sc:"couple",price:15,kf:false,note:"The usual."}],ctx:[]},{id:"shake-bar",name:"The Shake Bar",sn:"Shake Bar",cat:"dessert",emoji:"🧋",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:1,lo:267,ld:"2025-06-28",fd:"2025-06-28",acC:15,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"shake-bar-d",title:"Default Order",items:["Creamy Dream"],sc:"couple",price:15,kf:false,note:"The usual."}],ctx:[]},{id:"potbelly",name:"Potbelly",cat:"subs",emoji:"🐷",hs:0.55,cs:0.65,ts:0.20,ks:0.60,gs:0.70,ls:0.20,rs:0.70,ss:0.40,bl:1,sl:1,fav:false,bo:false,to:1,to90:0,to365:0,lo:475,ld:"2024-12-02",fd:"2024-12-02",acC:50,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"potbelly-d",title:"Default Order",items:["Chicken Club","Dream Bar","Oatmeal Chocolate Chip Cookie"],sc:"couple",price:50,kf:false,note:"The usual."}],ctx:[{when:"female",w:-3,label:"Kevin-leaning"},{when:"kids",w:-3,label:"Kevin-leaning"}]},{id:"firehouse-subs",name:"Firehouse Subs",sn:"Firehouse Subs",cat:"subs",emoji:"🚒",hs:0.45,cs:0.65,ts:0.20,ks:0.60,gs:0.70,ls:0.20,rs:0.70,ss:0.40,bl:1,sl:1,fav:false,bo:false,to:1,to90:0,to365:0,lo:510,ld:"2024-10-28",fd:"2024-10-28",acC:55,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"firehouse-subs-d",title:"Default Order",items:["Smoked Turkey Breast","New York Steamer®","Thanksgiving Sub"],sc:"couple",price:55,kf:false,note:"The usual."}],ctx:[{when:"female",w:-3,label:"Kevin-leaning"},{when:"kids",w:-3,label:"Kevin-leaning"}]},{id:"dairy-queen",name:"Dairy Queen",cat:"dessert",emoji:"👸",hs:0.05,cs:0.60,ts:0.95,ks:0.80,gs:0.50,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:554,ld:"2024-09-14",fd:"2024-09-14",acC:25,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"dairy-queen-d",title:"Default Order",items:["BUTTERFINGER® BLIZZARD® Treat","Chicken Strip Baskets w/Drink","Pretzel Sticks with Zesty Queso"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[]},{id:"first-watch",name:"First Watch",cat:"breakfast",emoji:"☀️",hs:0.45,cs:0.70,ts:0.50,ks:0.70,gs:0.60,ls:0.10,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1218,ld:"2022-11-20",fd:"2022-11-20",acC:35,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"first-watch-d",title:"Default Order",items:["The Traditional","Fresh Seasoned Potatoes","French Toast"],sc:"couple",price:35,kf:false,note:"The usual."}],ctx:[{when:"group",w:4,label:"Premium brunch"}]},{id:"ho-wok",name:"Ho Wok",cat:"asian",emoji:"🥘",hs:0.35,cs:0.75,ts:0.25,ks:0.50,gs:0.80,ls:0.70,rs:0.65,ss:0.80,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1268,ld:"2022-10-01",fd:"2022-10-01",acC:15,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"ho-wok-d",title:"Default Order",items:["C10. General Tso's Chicken"],sc:"couple",price:15,kf:false,note:"The usual."}],ctx:[]},{id:"mr-dunderbaks",name:"Mr Dunderbak's",sn:"Mr Dunderbak's",cat:"casual-dining",emoji:"🇩🇪",hs:0.35,cs:0.75,ts:0.35,ks:0.55,gs:0.70,ls:0.50,rs:0.70,ss:0.55,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1386,ld:"2022-06-05",fd:"2022-06-05",acC:50,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"mr-dunderbaks-d",title:"Default Order",items:["Der New Yorker","Der Reuben (Grilled Reuben)","Upcharge for side of Potato Pancakes"],sc:"couple",price:50,kf:false,note:"The usual."}],ctx:[]},{id:"buffalo-wild-wings",name:"Buffalo Wild Wings",sn:"Buffalo Wild Wings",spicy:"optional",cat:"wings",emoji:"🦬",hs:0.20,cs:0.80,ts:0.30,ks:0.50,gs:0.70,ls:0.30,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1516,ld:"2022-01-26",fd:"2022-01-26",acC:25,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"buffalo-wild-wings-d",title:"Default Order",items:["Bottled Soda","Regular French Fries","Boneless Wings"],sc:"couple",price:25,kf:false,note:"The usual."}],ctx:[{when:"mood-comfort",w:4,label:"Comfort wings"},{when:"mood-trash-goblin",w:4,label:"Trash mode wings"}]},{id:"burger-21",name:"Burger 21",cat:"burgers",emoji:"🔢",hs:0.15,cs:0.85,ts:0.35,ks:0.65,gs:0.60,ls:0.20,rs:0.70,ss:0.50,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1709,ld:"2021-07-17",fd:"2021-07-17",acC:30,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"burger-21-d",title:"Default Order",items:["#2 Cheesy","Chocolate Malted Milk Ball","Half + Half Fries Shareable"],sc:"couple",price:30,kf:false,note:"The usual."}],ctx:[{when:"couple",w:5,label:"Date night burger"},{when:"kids",w:-3,label:"Not great with kids"}]},{id:"beef-o-bradys",name:"Beef 'O' Brady's",sn:"Beef O'Brady's",cat:"casual-dining",emoji:"🏈",hs:0.35,cs:0.75,ts:0.35,ks:0.55,gs:0.70,ls:0.50,rs:0.70,ss:0.55,bl:2,sl:2,fav:false,bo:false,to:1,to90:0,to365:0,lo:1727,ld:"2021-06-29",fd:"2021-06-29",acC:60,streak:0,cw:0.5,tags:["Viable Path"],notes:"1 lifetime orders.",orders:[{id:"beef-o-bradys-d",title:"Default Order",items:["Prime Rib Garlic Melt","Prime Rib Watterson","Grilled Chicken Wrap"],sc:"couple",price:60,kf:false,note:"The usual."}],ctx:[]},{id:"walk-ons",name:"Walk-On's",cat:"casual-dining",emoji:"🏀",hs:0.35,cs:0.75,ts:0.35,ks:0.55,gs:0.70,ls:0.50,rs:0.70,ss:0.55,bl:2,sl:2,fav:false,bo:false,to:2,to90:0,to365:0,lo:154,ld:"2025-10-19",fd:"2025-10-02",acC:45,streak:0,cw:0.5,tags:["Viable Path"],notes:"2 lifetime orders.",orders:[{id:"walk-ons-d",title:"Default Order",items:["Slice of Garlic Bread"],sc:"couple",price:45,kf:false,note:"The usual."}],ctx:[]}];

var GROUPS=[{id:"kevin-solo",name:"Kevin's Call",emoji:"🎧",people:["kevin"]},{id:"jenna-solo",name:"Jenna's Pick",emoji:"🧘",people:["jenna"]},{id:"couple",name:"The Two of Us",emoji:"💑",people:["kevin","jenna"]},{id:"family",name:"The Starting Five",emoji:"🏠",people:["kevin","jenna","madi","jack","emmy"]},{id:"family-plus",name:"The Extended Cut",emoji:"👨\u200d👩\u200d👧\u200d👦",people:["kevin","jenna","madi","jack","emmy","jenna-mom","jenna-dad"]},{id:"big-family",name:"The Whole Crew",emoji:"🎪",people:["kevin","jenna","madi","jack","emmy","jenna-mom","jenna-dad","kevin-mom","zoe","leah"]}];

var MOODS=[{id:"healthy",label:"Clean Input",emoji:"\uD83E\uDD6C",c:"#34D399",desc:"Light, fresh, nutritious"},{id:"balanced",label:"Balanced",emoji:"\u2696\uFE0F",c:"#4A9EFF",desc:"A little of everything"},{id:"comfort",label:"Comfort Mode",emoji:"\uD83D\uDECB\uFE0F",c:"#FBBF24",desc:"Warm, filling, satisfying"},{id:"trash-goblin",label:"Full Override",emoji:"\uD83D\uDD25",c:"#F87171",desc:"Zero guilt, maximum flavor"},{id:"sweet-treat",label:"Treat Protocol",emoji:"\uD83C\uDF6A",c:"#FB923C",desc:"Dessert is the meal"},{id:"kid-peace",label:"Kid-Safe",emoji:"\uD83E\uDDF8",c:"#67E8F9",desc:"Keep it simple for little ones"},{id:"crowd-survival",label:"Group Consensus",emoji:"\uD83E\uDD1D",c:"#A78BFA",desc:"Something everyone can agree on"},{id:"safe-default",label:"Reliable Default",emoji:"\uD83D\uDEE1\uFE0F",c:"#94A3B8",desc:"Tried and true, no surprises"},{id:"roulette",label:"Random Seed",emoji:"\uD83C\uDFB2",c:"#FB7185",desc:"Surprise me, I\u2019m feeling lucky"}];

var TC={"Healthy Hero":["#065F46","#34D399"],"Proven Reliable":["#4A1942","#F472B6"],"Kid-Safe":["#78350F","#FBBF24"],"Comfort Override":["#7F1D1D","#F87171"],"Crowd Pleaser":["#312E81","#A78BFA"],"Cheap & Easy":["#14532D","#4ADE80"],"Sweet Tooth Emergency":["#78350F","#FB923C"],"Toddler Compatible":["#164E63","#67E8F9"],"Stable Output":["#3B0764","#C084FC"],"Low Veto Risk":["#4A1942","#F472B6"],"Surprisingly Sensible":["#065F46","#34D399"],"Group-Safe":["#4A1942","#F9A8D4"],"Comfort Path":["#78350F","#FBBF24"],"Viable Path":["#1E293B","#94A3B8"],"Treat Protocol":["#78350F","#FB923C"],"Best for Leftovers":["#164E63","#22D3EE"],"New Discovery":["#312E81","#A78BFA"]};

/* Meal fitness: how appropriate is each restaurant for each meal type (0-1) */
var MEAL_FIT={"arbys":{breakfast:0.05,brunch:0.2,lunch:0.65,dinner:0.95,latenight:0.4},"bjs":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.65},"cantina":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"chick-fil-a":{breakfast:0.2,brunch:0.2,lunch:0.95,dinner:0.65,latenight:0.2},"chilis":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.4},"chipotle":{breakfast:0.05,brunch:0.05,lunch:0.65,dinner:0.95,latenight:0.65},"crumbl":{breakfast:0.05,brunch:0.4,lunch:0.65,dinner:0.95,latenight:0.4},"culvers":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.4},"dunkin":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.05},"five-guys":{breakfast:0.05,brunch:0.05,lunch:0.2,dinner:0.95,latenight:0.65},"fresh-kitchen":{breakfast:0.05,brunch:0.05,lunch:0.2,dinner:0.95,latenight:0.4},"ice-sssscreamin":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.65,latenight:0.95},"jersey-mikes":{breakfast:0.05,brunch:0.4,lunch:0.95,dinner:0.65,latenight:0.05},"mcdonalds":{breakfast:0.4,brunch:0.2,lunch:0.4,dinner:0.95,latenight:0.65},"new-china":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"outback":{breakfast:0.05,brunch:0.05,lunch:0.4,dinner:0.95,latenight:0.05},"panera":{breakfast:0.2,brunch:0.2,lunch:0.95,dinner:0.65,latenight:0.2},"red-robin":{breakfast:0.05,brunch:0.05,lunch:0.4,dinner:0.95,latenight:0.2},"steak-n-shake":{breakfast:0.05,brunch:0.05,lunch:0.65,dinner:0.4,latenight:0.95},"taco-bell":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.85,latenight:0.95},"tropical-smoothie":{breakfast:0.95,brunch:0.85,lunch:0.2,dinner:0.2,latenight:0.05},"wawa":{breakfast:0.95,brunch:0.4,lunch:0.65,dinner:0.4,latenight:0.4},"wendys":{breakfast:0.4,brunch:0.05,lunch:0.05,dinner:0.85,latenight:0.85},"subway":{breakfast:0.05,brunch:0.05,lunch:0.95,dinner:0.85,latenight:0.05},"carrabbas":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"dickeys":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.4},"minerva":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.4},"kekes":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.05},"sweetfrog":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"wingstop":{breakfast:0.05,brunch:0.05,lunch:0.4,dinner:0.65,latenight:0.95},"brunchery":{breakfast:0.95,brunch:0.05,lunch:0.4,dinner:0.05,latenight:0.05},"cali":{breakfast:0.05,brunch:0.05,lunch:0.65,dinner:0.95,latenight:0.05},"hyderabad-biryani":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.65},"ho-king":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"twistee-treat":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"krispy-kreme":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.05},"panda-express":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.95},"daves-hot-chicken":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.95},"pizza-hut":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"peach-cobbler":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.85},"burger-king":{breakfast:0.05,brunch:0.85,lunch:0.05,dinner:0.85,latenight:0.85},"checkers":{breakfast:0.05,brunch:0.05,lunch:0.65,dinner:0.85,latenight:0.65},"planet-smoothie":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.85,latenight:0.05},"cold-stone":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"smoothie-king":{breakfast:0.95,brunch:0.85,lunch:0.05,dinner:0.05,latenight:0.05},"thai-ruby":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"sonic":{breakfast:0.05,brunch:0.05,lunch:0.95,dinner:0.05,latenight:0.65},"shake-shack":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.85,latenight:0.85},"cracker-barrel":{breakfast:0.95,brunch:0.85,lunch:0.65,dinner:0.85,latenight:0.05},"ihop":{breakfast:0.05,brunch:0.95,lunch:0.05,dinner:0.05,latenight:0.05},"chicken-salad-chick":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"insomnia-cookies":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.95},"pdq":{breakfast:0.05,brunch:0.05,lunch:0.95,dinner:0.05,latenight:0.05},"cicis":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"papa-johns":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"hole-in-one-donut":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.05},"shake-bar":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.95},"potbelly":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"firehouse-subs":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"dairy-queen":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"first-watch":{breakfast:0.95,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.05},"ho-wok":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.05,latenight:0.95},"mr-dunderbaks":{breakfast:0.05,brunch:0.05,lunch:0.95,dinner:0.05,latenight:0.05},"buffalo-wild-wings":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"burger-21":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05},"beef-o-bradys":{breakfast:0.05,brunch:0.05,lunch:0.95,dinner:0.05,latenight:0.05},"walk-ons":{breakfast:0.05,brunch:0.05,lunch:0.05,dinner:0.95,latenight:0.05}};
var DOW_FIT={"arbys":{0:0.09,1:0.09,2:0.22,3:0.16,4:0.16,5:0.09,6:0.20},"bjs":{0:0.13,1:0.00,2:0.20,3:0.13,4:0.20,5:0.27,6:0.07},"cantina":{0:0.08,1:0.22,2:0.14,3:0.16,4:0.20,5:0.16,6:0.06},"chick-fil-a":{0:0.19,1:0.29,2:0.10,3:0.21,4:0.14,5:0.08,6:0.00},"chilis":{0:0.11,1:0.11,2:0.26,3:0.08,4:0.13,5:0.21,6:0.11},"chipotle":{0:0.04,1:0.33,2:0.07,3:0.22,4:0.11,5:0.04,6:0.19},"crumbl":{0:0.34,1:0.06,2:0.16,3:0.00,4:0.22,5:0.22,6:0.00},"culvers":{0:0.14,1:0.09,2:0.05,3:0.23,4:0.18,5:0.23,6:0.09},"dunkin":{0:0.12,1:0.00,2:0.06,3:0.19,4:0.06,5:0.38,6:0.19},"five-guys":{0:0.19,1:0.14,2:0.05,3:0.10,4:0.10,5:0.10,6:0.33},"fresh-kitchen":{0:0.17,1:0.12,2:0.19,3:0.14,4:0.10,5:0.19,6:0.10},"ice-sssscreamin":{0:0.00,1:0.00,2:0.25,3:0.25,4:0.25,5:0.00,6:0.25},"jersey-mikes":{0:0.08,1:0.08,2:0.21,3:0.04,4:0.04,5:0.29,6:0.25},"mcdonalds":{0:0.24,1:0.10,2:0.14,3:0.14,4:0.10,5:0.19,6:0.10},"new-china":{0:0.00,1:0.20,2:0.20,3:0.00,4:0.00,5:0.40,6:0.20},"outback":{0:0.12,1:0.06,2:0.00,3:0.19,4:0.44,5:0.06,6:0.12},"panera":{0:0.12,1:0.12,2:0.03,3:0.16,4:0.19,5:0.22,6:0.16},"red-robin":{0:0.06,1:0.06,2:0.10,3:0.10,4:0.32,5:0.10,6:0.26},"steak-n-shake":{0:0.27,1:0.07,2:0.20,3:0.13,4:0.07,5:0.07,6:0.20},"taco-bell":{0:0.07,1:0.14,2:0.21,3:0.07,4:0.43,5:0.07,6:0.00},"tropical-smoothie":{0:0.11,1:0.11,2:0.18,3:0.18,4:0.11,5:0.14,6:0.18},"wawa":{0:0.09,1:0.08,2:0.13,3:0.10,4:0.19,5:0.22,6:0.18},"wendys":{0:0.24,1:0.12,2:0.06,3:0.06,4:0.41,5:0.06,6:0.06},"subway":{0:0.12,1:0.0,2:0.12,3:0.25,4:0.12,5:0.12,6:0.25},"carrabbas":{0:0.0,1:0.1,2:0.4,3:0.0,4:0.3,5:0.2,6:0.0},"dickeys":{0:0.0,1:0.12,2:0.25,3:0.25,4:0.12,5:0.12,6:0.12},"minerva":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.43,5:0.29,6:0.29},"kekes":{0:0.14,1:0.0,2:0.14,3:0.0,4:0.43,5:0.14,6:0.14},"sweetfrog":{0:0.14,1:0.0,2:0.14,3:0.29,4:0.0,5:0.14,6:0.29},"wingstop":{0:0.43,1:0.0,2:0.0,3:0.14,4:0.29,5:0.14,6:0.0},"brunchery":{0:0.0,1:0.0,2:0.29,3:0.14,4:0.0,5:0.43,6:0.14},"cali":{0:0.0,1:0.33,2:0.33,3:0.17,4:0.0,5:0.0,6:0.17},"hyderabad-biryani":{0:0.2,1:0.0,2:0.2,3:0.0,4:0.0,5:0.4,6:0.2},"ho-king":{0:0.0,1:0.25,2:0.0,3:0.0,4:0.0,5:0.5,6:0.25},"twistee-treat":{0:0.0,1:0.5,2:0.0,3:0.25,4:0.25,5:0.0,6:0.0},"krispy-kreme":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:1.0},"panda-express":{0:0.0,1:0.33,2:0.0,3:0.0,4:0.33,5:0.33,6:0.0},"daves-hot-chicken":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.33,5:0.67,6:0.0},"pizza-hut":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.33,5:0.67,6:0.0},"peach-cobbler":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.67,5:0.33,6:0.0},"burger-king":{0:0.0,1:0.0,2:0.33,3:0.0,4:0.33,5:0.33,6:0.0},"checkers":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.5,5:0.0,6:0.5},"planet-smoothie":{0:0.33,1:0.0,2:0.0,3:0.0,4:0.67,5:0.0,6:0.0},"cold-stone":{0:0.0,1:0.33,2:0.33,3:0.0,4:0.33,5:0.0,6:0.0},"smoothie-king":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.33,6:0.67},"thai-ruby":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.5,5:0.5,6:0.0},"sonic":{0:0.0,1:0.0,2:0.0,3:0.25,4:0.25,5:0.25,6:0.25},"shake-shack":{0:0.0,1:0.5,2:0.0,3:0.0,4:0.5,5:0.0,6:0.0},"cracker-barrel":{0:0.0,1:0.0,2:0.0,3:0.5,4:0.0,5:0.0,6:0.5},"ihop":{0:0.0,1:0.0,2:0.0,3:0.5,4:0.0,5:0.0,6:0.5},"chicken-salad-chick":{0:0.0,1:0.0,2:0.0,3:0.0,4:1.0,5:0.0,6:0.0},"insomnia-cookies":{0:0.0,1:0.0,2:0.0,3:0.5,4:0.5,5:0.0,6:0.0},"pdq":{0:0.5,1:0.0,2:0.5,3:0.0,4:0.0,5:0.0,6:0.0},"cicis":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:1.0,6:0.0},"papa-johns":{0:0.0,1:0.0,2:0.0,3:0.0,4:1.0,5:0.0,6:0.0},"hole-in-one-donut":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:1.0},"shake-bar":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:1.0,6:0.0},"potbelly":{0:1.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:0.0},"firehouse-subs":{0:1.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:0.0},"dairy-queen":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:1.0,6:0.0},"first-watch":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:1.0},"ho-wok":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:1.0,6:0.0},"mr-dunderbaks":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:1.0},"buffalo-wild-wings":{0:0.0,1:0.0,2:1.0,3:0.0,4:0.0,5:0.0,6:0.0},"burger-21":{0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:1.0,6:0.0},"beef-o-bradys":{0:0.0,1:1.0,2:0.0,3:0.0,4:0.0,5:0.0,6:0.0},"walk-ons":{0:0.0,1:0.0,2:0.5,3:0.0,4:0.0,5:0.5,6:0.0}};

/* Operating hours: [open, close] in 24h. null = closed. */
var HOURS={"chick-fil-a":{def:[6,22],sun:null},"wawa":{def:[0,24],sun:[0,24]},"cantina":{def:[11,22],sun:[11,21]},"arbys":{def:[10,22],sun:[10,21]},"fresh-kitchen":{def:[10,21],sun:[10,21]},"chilis":{def:[11,23],sun:[11,22]},"panera":{def:[7,21],sun:[8,20]},"crumbl":{def:[12,22],sun:[12,22]},"tropical-smoothie":{def:[7,21],sun:[8,20]},"red-robin":{def:[11,22],sun:[11,21]},"jersey-mikes":{def:[10,21],sun:[10,20]},"culvers":{def:[10,22],sun:[10,22]},"five-guys":{def:[11,22],sun:[11,21]},"mcdonalds":{def:[5,23],sun:[6,23]},"wendys":{def:[6.5,1],sun:[8,1]},"dunkin":{def:[5,21],sun:[6,20]},"steak-n-shake":{def:[11,23],sun:[11,22]},"taco-bell":{def:[7,1],sun:[9,1]},"chipotle":{def:[10.75,22],sun:[10.75,21]},"new-china":{def:[11,22],sun:[12,21]},"ice-sssscreamin":{def:[12,22],sun:[12,21]},"outback":{def:[11,22],sun:[11,21]},"bjs":{def:[11,23],sun:[11,22]},"subway":{def:[7,22],sun:[8,21]},"carrabbas":{def:[11,22],sun:[11,21]},"dickeys":{def:[11,21],sun:[11,21]},"minerva":{def:[11,22],sun:[11,22]},"kekes":{def:[7,14.5],sun:[7,14.5]},"sweetfrog":{def:[12,22],sun:[12,21]},"wingstop":{def:[11,24],sun:[11,23]},"brunchery":{def:[8,14],sun:[8,14]},"cali":{def:[11,21],sun:[11,21]},"hyderabad-biryani":{def:[11,23],sun:[11,23]},"ho-king":{def:[11,22],sun:[11,21]},"twistee-treat":{def:[12,22],sun:[12,22]},"krispy-kreme":{def:[6,22],sun:[6,22]},"panda-express":{def:[10,22],sun:[10,21]},"daves-hot-chicken":{def:[11,24],sun:[11,23]},"pizza-hut":{def:[10,23],sun:[10,22]},"peach-cobbler":{def:[11,22],sun:[12,20]},"burger-king":{def:[6,23],sun:[7,23]},"checkers":{def:[10,24],sun:[10,23]},"planet-smoothie":{def:[7,20],sun:[9,18]},"cold-stone":{def:[11,22],sun:[11,21]},"smoothie-king":{def:[7,21],sun:[9,19]},"thai-ruby":{def:[11,22],sun:[11,21]},"sonic":{def:[6,23],sun:[7,23]},"shake-shack":{def:[11,22],sun:[11,21]},"cracker-barrel":{def:[7,21],sun:[7,21]},"ihop":{def:[0,24],sun:[0,24]},"chicken-salad-chick":{def:[10,21],sun:[10,20]},"insomnia-cookies":{def:[11,3],sun:[11,1]},"pdq":{def:[6,23],sun:[7,23]},"cicis":{def:[10,23],sun:[10,22]},"papa-johns":{def:[10,23],sun:[10,22]},"hole-in-one-donut":{def:[7,15],sun:[7,15]},"shake-bar":{def:[12,22],sun:[12,21]},"potbelly":{def:[10,21],sun:[10,20]},"firehouse-subs":{def:[10,21],sun:[10,20]},"dairy-queen":{def:[12,22],sun:[12,21]},"first-watch":{def:[7,14.5],sun:[7,14.5]},"ho-wok":{def:[11,22],sun:[11,21]},"mr-dunderbaks":{def:[11,22],sun:[11,21]},"buffalo-wild-wings":{def:[11,24],sun:[11,23]},"burger-21":{def:[11,22],sun:[11,21]},"beef-o-bradys":{def:[11,22],sun:[11,21]},"walk-ons":{def:[11,23],sun:[11,22]}};

/* Typical DoorDash delivery time in minutes */
var ETA={"chick-fil-a":20,"wawa":35,"cantina":34,"arbys":29,"fresh-kitchen":29,"chilis":61,"panera":30,"crumbl":36,"tropical-smoothie":45,"red-robin":41,"jersey-mikes":33,"culvers":37,"five-guys":31,"mcdonalds":25,"wendys":35,"dunkin":27,"steak-n-shake":29,"taco-bell":28,"chipotle":26,"new-china":35,"ice-sssscreamin":37,"outback":62,"bjs":52,"subway":22,"carrabbas":30};

var DD_SLUG={"chick-fil-a":"chick-fil-a","wawa":"wawa","cantina":"cantina-mexican-grill","arbys":"arbys","fresh-kitchen":"fresh-kitchen","chilis":"chilis","panera":"panera-bread","crumbl":"crumbl-cookies","tropical-smoothie":"tropical-smoothie-cafe","red-robin":"red-robin","jersey-mikes":"jersey-mikes","culvers":"culvers","five-guys":"five-guys","mcdonalds":"mcdonalds","wendys":"wendys","dunkin":"dunkin","steak-n-shake":"steak-n-shake","taco-bell":"taco-bell","chipotle":"chipotle-mexican-grill","new-china":"new-china","ice-sssscreamin":"ice-sssscreamin","outback":"outback-steakhouse","bjs":"bjs-restaurant","subway":"subway","carrabbas":"carrabbas-italian-grill","dickeys":"dickeys-barbecue-pit","minerva":"minerva-indian-restaurant","kekes":"kekes-breakfast-cafe","sweetfrog":"sweetfrog","wingstop":"wingstop","brunchery":"brunchery","cali":"cali","hyderabad-biryani":"hyderabad-biryani-house","ho-king":"ho-king","twistee-treat":"twistee-treat","krispy-kreme":"krispy-kreme","panda-express":"panda-express","daves-hot-chicken":"daves-hot-chicken","pizza-hut":"pizza-hut","peach-cobbler":"peach-cobbler-factory","burger-king":"burger-king","checkers":"checkers","planet-smoothie":"planet-smoothie","cold-stone":"cold-stone-creamery","smoothie-king":"smoothie-king","thai-ruby":"thai-ruby","sonic":"sonic-drive-in","walk-ons":"walk-ons","shake-shack":"shake-shack","cracker-barrel":"cracker-barrel","ihop":"ihop","chicken-salad-chick":"chicken-salad-chick","insomnia-cookies":"insomnia-cookies","cicis":"cicis-pizza","papa-johns":"papa-johns","hole-in-one-donut":"hole-in-one-donut","shake-bar":"shake-bar","potbelly":"potbelly-sandwich-shop","firehouse-subs":"firehouse-subs","dairy-queen":"dairy-queen","pdq":"pdq","first-watch":"first-watch","ho-wok":"ho-wok","mr-dunderbaks":"mr-dunderbaks","buffalo-wild-wings":"buffalo-wild-wings","burger-21":"burger-21","beef-o-bradys":"beef-o-bradys"};
function isOpenNow(rid){
var h=HOURS[rid]; if(!h) return true;
var now=new Date(), dow=now.getDay(), hr=now.getHours()+now.getMinutes()/60;
var schedule=(dow===0&&h.sun!==undefined)?h.sun:h.def;
if(schedule===null) return false;
var open=schedule[0], close=schedule[1];
if(close<open) return hr>=open||hr<close; /* wraps past midnight */
return hr>=open&&hr<close;
}

function getDDLink(rid){
var slug=DD_SLUG[rid]; if(!slug) return null;
return "doordash://search?query="+encodeURIComponent(slug.replace(/-/g," "));
}

function getETA(rid){return ETA[rid]||30;}
function fmtDate(d){if(!d)return"—";var dt=new Date(d);var m=dt.getMonth()+1,day=dt.getDate(),y=dt.getFullYear();return m+"/"+day+"/"+y;}
function getAc(r,sc){var m={solo:"acS",couple:"acC",family:"acF",group:"acG"};var k=m[sc];if(k&&r[k])return r[k];var fb=r.acC||r.acS||r.acF||r.acG||null;return fb;}

/* Animation delay for resolve spinner (ms) */
var RESOLVE_DELAY=900;
/* Subtle haptic tap for mobile */
function haptic(ms){try{if(navigator.vibrate)navigator.vibrate(ms||10);}catch(e){}}

/* SCORING ENGINE */
function scoreAll(rr,sel,ppl,hist,mc,gs2){try{if(!gs2)gs2=GLOBAL_DEFAULTS;var kidIds=ppl.filter(function(p){return p.age!=="adult";}).map(function(p){return p.id;});var hasKids=sel.sp.some(function(id){return kidIds.indexOf(id)>=0;})||(sel.xk||0)>0;var xa=sel.xa||0,xk=sel.xk||0;var gs=sel.sp.length+xa+xk,isGrp=gs>3,isSolo=gs===1,isT=sel.mood==="sweet-treat";var rm={};(hist||[]).forEach(function(h){if(!rm[h.rid])rm[h.rid]={u:0,d:0};if(h.rating==="up")rm[h.rid].u++;if(h.rating==="down")rm[h.rid].d++;});var mwm={healthy:{h:3,c:-1,t:-1},balanced:{h:1.2,c:1,t:.5},comfort:{h:-.5,c:3,t:.5},"trash-goblin":{h:-2,c:2.5,t:1},"sweet-treat":{h:-1,c:.5,t:4},"kid-peace":{h:0,c:1,t:.5},"crowd-survival":{h:0,c:1,t:0},"safe-default":{h:.5,c:.5,t:0},roulette:{h:0,c:0,t:0}};var bm={cheap:1,normal:2,flexible:3,feast:4},sm={fast:1,normal:2};var FEMALE_IDS_S=ppl.filter(function(p){return p.g==="f";}).map(function(p){return p.id;});var gtp={adv:.5,hc:.5,sp:.5,meat:.5,sweet:.5};(function(){var members=sel.sp.map(function(id){return ppl.find(function(p){return p.id===id;});}).filter(Boolean);if(members.length>0){var sums={adv:0,hc:0,sp:0,meat:0,sweet:0},tw=0;members.forEach(function(p){var w=(gs2.femaleWeight&&FEMALE_IDS_S.indexOf(p.id)>=0)?1.3:1;["adv","hc","sp","meat","sweet"].forEach(function(k){sums[k]+=(p[k]||.5)*w;});tw+=w;});if(tw>0)["adv","hc","sp","meat","sweet"].forEach(function(k){gtp[k]=sums[k]/tw;});}})();var sc=rr.filter(function(r){return!r.bo&&isOpenNow(r.id);}).map(function(r){r=Object.assign({hs:.5,cs:.5,ts:.3,ks:.5,gs:.5,ls:.3,rs:.5,ss:.5,bl:2,sl:2,to:0,orders:[],tags:[],ctx:[]},r);var s=50,re=[],co=[];var mw=mwm[sel.mood]||{};var ms=(mw.h||0)*r.hs*10+(mw.c||0)*r.cs*10+(mw.t||0)*r.ts*10;s+=ms;if(ms>8)re.push("Strong mood fit");var tps=0;tps+=(gtp.hc-.5)*r.hs*12;tps+=((1-gtp.hc)-.5)*r.cs*8;tps+=(gtp.sweet-.5)*r.ts*10;tps+=(gtp.adv-.5)*(1-r.rs)*8;tps+=((1-gtp.adv)-.5)*r.rs*6;if(r.cat==="burgers"||r.cat==="fast-food")tps+=(gtp.meat-.5)*8;if(r.cat==="healthy")tps+=(gtp.hc-.5)*10;s+=tps;if(tps>5)re.push("Good taste fit");if(tps<-5)co.push("Taste mismatch");if(r.spicy===true||r.spicy===2){var avgSp=gtp.sp||.5;if(avgSp<.3){s-=8;co.push("Too spicy for this group");}else if(avgSp>=.6)s+=3;}if(r.spicy==="optional"){var avgSp2=gtp.sp||.5;if(avgSp2>=.6)s+=2;}if(sel.mood==="roulette")s+=(Math.random()-.3)*22;var bt=bm[sel.budget]||2,bd=Math.abs(r.bl-bt);if(bd===0){s+=8;re.push("Budget aligned");}else if(bd===1)s+=2;else{s-=bd*6;co.push("Budget mismatch");}var st=sm[sel.speed]||2;if(r.sl<=st){s+=5;if(sel.speed==="fast"&&r.sl===1)re.push("Fast path");}else{s-=8;co.push("Speed concern");}if(sel.kf||hasKids){s+=r.ks*15-5;if(r.ks>=.7)re.push("Kid-safe");if(r.ks<.4){s-=12;co.push("Low kid compat");}}if(isGrp||sel.go){s+=r.gs*12-3;if(r.gs>=.7)re.push("Group-compatible");if(r.gs<.4)co.push("Complex group order");}if(isSolo){if(r.ss<.4)s+=3;if(r.bl<=2)s+=3;}if(gs===2&&!hasKids)s+=r.rs*5;if(sel.lo){s+=r.ls*10;if(r.ls>=.6)re.push("High leftover yield");}if(isGrp)s+=r.ss*8;if(r.fav){s+=8;re.push("Household favorite");}if(sel.fam==="safe"){s+=r.rs*12;if(r.rs>=.8)re.push("Proven reliable");}else if(sel.fam==="surprise"){s+=(1-r.rs)*8;if(r.to<4)re.push("Low frequency");}else s+=r.rs*5;/* Staleness: penalize restaurants with zero recent orders */if(r.to365!=null&&r.to365===0&&r.to>0){s-=8;co.push("Haven\u2019t ordered in a while");}if(r.to>10&&(r.to90||0)>0)s+=3;if(isT&&r.ts<.5)s-=15;if(gs2.dessertPenalty&&!isT&&r.cat==="dessert")s-=12;if(gs2.dessertPenalty&&!isT&&r.cat==="coffee-snack")s-=8;if(gs2.dessertPenalty&&!isT&&r.ts>=0.8&&r.cat!=="dessert")s-=8;if(sel.mood==="kid-peace"){s+=r.ks*18-5;s+=r.rs*8;}if(sel.mood==="safe-default"){s+=r.rs*15;if(r.fav)s+=10;}var rb=rm[r.id];if(rb){s+=rb.u*3;s-=rb.d*4;}if(!mc)mc=getMealContext();var mf=MEAL_FIT[r.id];if(mf){var fit=mf[mc.meal]!=null?mf[mc.meal]:0.5;if(fit>=0.8){s+=10;re.push("Good for "+mc.label.toLowerCase());}else if(fit>=0.4){s+=(fit-0.5)*15;}else if(fit>=0.15){s-=15;co.push("Unusual for "+mc.label.toLowerCase());}else{s-=30;co.push("Wrong time of day");}}if(mc.treatOk&&r.ts>=0.7)s+=5;if(mc.lightBias&&r.hs>=0.6)s+=4;if(mc.lightBias&&r.cs>=0.8)s-=3;var df=DOW_FIT[r.id];if(df){var today=new Date().getDay();var todayIdx=today===0?6:today-1;var dowPct=df[todayIdx]||0;var avg=1/7;var dowSample=Math.min(r.to,30);var dowWeight=dowSample/30;var dowRaw=(dowPct-avg)*35*dowWeight;var dowCapped=Math.max(-10,Math.min(10,dowRaw));s+=dowCapped;if(dowPct>avg*1.5&&dowSample>=5)re.push("Popular on "+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][todayIdx]+"s");if(dowPct===0&&dowSample>=10){s-=5;co.push("Never ordered on "+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][todayIdx]+"s");}}/* ── Data-driven modifiers ── */var hasJ=sel.sp.indexOf("jenna")>=0,hasK=sel.sp.indexOf("kevin")>=0,kSolo=isSolo&&hasK,jInvolved=hasJ||sel.sp.some(function(id){return FEMALE_IDS_S.indexOf(id)>=0;});/* Person mods: apply each selected person's restaurant/category modifiers */sel.sp.forEach(function(pid){var person=ppl.find(function(p){return p.id===pid;});if(!person||!person.mods)return;person.mods.forEach(function(mod){if(mod.rid&&mod.rid===r.id){if(mod.solo&&!kSolo)return;s+=mod.w;if(mod.w>0)re.push(mod.label);if(mod.w<0)co.push(mod.label);}else if(mod.cat&&mod.cat===r.cat){if(mod.solo&&!kSolo)return;s+=mod.w;if(mod.w>0)re.push(mod.label);if(mod.w<0)co.push(mod.label);}});});/* Restaurant ctx rules */if(r.ctx){r.ctx.forEach(function(cx){var applies=false;if(cx.when==="always")applies=true;if(cx.when==="kids"&&hasKids)applies=true;if(cx.when==="couple"&&!hasKids&&gs===2)applies=true;if(cx.when==="solo"&&isSolo)applies=true;if(cx.when==="group"&&isGrp)applies=true;if(cx.when==="female"&&jInvolved&&!kSolo)applies=true;if(cx.when==="latenight"&&mc.meal==="latenight")applies=true;if(cx.when==="breakfast"&&mc.meal==="breakfast")applies=true;if(cx.when==="brunch"&&mc.meal==="brunch")applies=true;if(cx.when==="mood-comfort"&&sel.mood==="comfort")applies=true;if(cx.when==="mood-trash-goblin"&&sel.mood==="trash-goblin")applies=true;if(cx.when==="mood-healthy"&&sel.mood==="healthy")applies=true;if(cx.when==="mood-other"&&sel.mood!=="healthy")applies=true;if(applies){s+=cx.w;if(cx.w>0)re.push(cx.label);if(cx.w<0)co.push(cx.label);}});}/* Global: kids restaurant boosts */if(hasKids){if(r.id==="culvers"||r.id==="mcdonalds"||r.id==="wendys")s+=4;if(r.id==="cantina")s+=3;if(r.id==="taco-bell")s+=2;if(r.id==="ho-king"||r.id==="new-china"||r.id==="thai-ruby")s+=3;if(r.id==="panera"||r.id==="jersey-mikes")s+=3;}/* ── Cuisine tag boost from quiz ── */var ct=sel.ct||"";if(ct){var catMap={"burgers":["burgers","fast-food"],"asian":["asian"],"indian":["indian"],"subs":["subs"],"pizza":["pizza"],"wings":["wings"],"bbq":["bbq"],"italian":["italian"],"mexican":["mexican","fast-food"],"smoothie":["healthy"],"breakfast":["breakfast"],"donuts":["breakfast","coffee-snack"],"froyo":["dessert"],"healthy":["healthy"],"premium":[],"budget":[],"solo_late":[]};var matchCats=catMap[ct]||[];if(matchCats.indexOf(r.cat)>=0){s+=12;re.push("Matches your craving");}if(ct==="premium"&&r.bl>=3)s+=8;if(ct==="budget"&&r.bl<=1)s+=8;if(ct==="solo_late"&&mc.meal==="latenight")s+=5;}/* ── Seasonal awareness (Florida) ── */var sMonth=new Date().getMonth();var isHotSzn=sMonth>=4&&sMonth<=8;var isMildSzn=sMonth>=10||sMonth<=1;if(isHotSzn){if(r.cat==="dessert"||r.ts>=.7)s+=4;if(r.hs>=.6)s+=3;if(r.cs>=.8)s-=3;re.length<4&&r.ts>=.7&&re.push("Summer treat weather");}if(isMildSzn){if(r.cs>=.7)s+=3;if(r.cat==="bbq")s+=2;re.length<4&&r.cs>=.7&&re.push("Cool-weather comfort");}/* ── Already had today penalty ── */if(sel._alreadyHad&&sel._alreadyHad===r.id){s-=30;co.push("Already had this today");}if(sel._alreadyHad){var ahRest=rr.find(function(x){return x.id===sel._alreadyHad;});if(ahRest&&ahRest.cat===r.cat&&r.id!==sel._alreadyHad){s-=10;co.push("Same cuisine as earlier");}}var vs=0;if(hasKids&&r.ks<.5)vs+=2;if(isGrp&&r.gs<.5)vs+=2;if(sel.mood==="healthy"&&r.hs<.4)vs++;if(bd>1)vs++;if(r.rs<.6)vs++;var vr=vs<=1?"low":vs<=3?"moderate":"high";var vtx=isSolo?{low:["Solid choice.","This one\u2019s a lock.","No-brainer.","You know you want this.","Strong pick."],moderate:["Decent option.","Could go either way.","Not your usual, but viable.","Worth considering.","On the radar."],high:["Risky pick.","Outside your comfort zone.","Bold move.","Might regret this one.","Adventurous."]}:{low:["Consensus likely.","Low household resistance.","Stable output.","Low friction.","Safe to proceed."],moderate:["Minor resistance possible.","Defensible, not unanimous.","Someone may want alternatives.","Moderate veto risk.","Proceed with awareness."],high:["Consensus unlikely.","Bold input for this group.","May trigger renegotiation.","Prepare a fallback.","High variance."]};var vfa=vtx[vr];var rHash=0;for(var ci=0;ci<r.id.length;ci++)rHash=(rHash*31+r.id.charCodeAt(ci))%vfa.length;var vf=vfa[Math.abs(rHash)%vfa.length];/* Easter eggs */if(r.id==="fresh-kitchen"&&jInvolved&&isSolo)vf="You already knew, didn\u2019t you?";if(r.id==="fresh-kitchen"&&jInvolved&&!isSolo)vf="Jenna\u2019s calling the shots here.";if(r.id==="taco-bell"&&kSolo&&mc.meal==="latenight")vf="Between you and God.";if(r.id==="crumbl")vf="You deserve this and you know it.";if(r.id==="sweetfrog")vf="It\u2019s froyo. It\u2019s basically health food.";if(r.id==="cold-stone")vf="Go big. No one\u2019s judging.";if(r.id==="ice-sssscreamin")vf="Calories don\u2019t count after 9pm.";if(r.id==="twistee-treat")vf="Sometimes you just need soft serve. No explanation needed.";if(r.id==="peach-cobbler")vf="Life is short. Eat the cobbler.";if(r.id==="krispy-kreme")vf="A dozen is a serving size if you believe in yourself.";if(r.id==="insomnia-cookies")vf="It\u2019s not insomnia if you planned it.";if(r.id==="dairy-queen")vf="Blizzards count as dinner if you\u2019re brave enough.";if(r.id==="shake-bar")vf="Milkshakes are just cold soup. Embrace it.";if(r.id==="chick-fil-a"&&vr==="low")vf="Is anyone surprised?";/* Late night roast mode (after 11pm + trash-goblin) */if(sel.mood==="trash-goblin"&&new Date().getHours()>=23){var lnr={"taco-bell":"Absolutely unhinged behavior. Respect.","mcdonalds":"The golden arches called. They said they\u2019re worried about you.","wendys":"Sir, it\u2019s almost midnight. Have some dignity. Just kidding, get the Baconator.","culvers":"Getting cheese curds at this hour is either genius or a cry for help.","five-guys":"You\u2019re really about to spend $47 at Five Guys at midnight, huh.","chick-fil-a":"It\u2019s closed and you know it. This is just pain.","dominos":"Rock bottom has a basement and it has a pizza tracker.","pizza-hut":"Stuffed crust at midnight. Your ancestors are watching.","popeyes":"Biscuit at midnight? Actually, can\u2019t argue with that."};if(lnr[r.id])vf=lnr[r.id];}var scn=isT?"treat":isSolo?"solo":hasKids?(isGrp?"group":"family"):(gs>3?"group":"couple");var curMeal=mc?mc.meal:"dinner";var mealMatch=function(ml){return ml===curMeal||(curMeal==="brunch"&&ml==="breakfast");};var bo=r.orders.find(function(o){return o.sc===scn&&o.ml&&mealMatch(o.ml);})||r.orders.find(function(o){return o.ml&&mealMatch(o.ml);})||r.orders.find(function(o){return o.sc===scn&&!o.ml;})||r.orders.find(function(o){return o.sc===scn;})||r.orders.find(function(o){return o.sc==="couple"&&!o.ml;})||r.orders[0]||null;var conf=s>75?"high":s>55?"medium":"low";return{rid:r.id,r:r,score:Math.round(s*10)/10,reasons:re.slice(0,4),concerns:co.slice(0,3),vetoRisk:vr,vetoFlavor:vf,confidence:conf,order:bo,tags:r.tags,eta:getETA(r.id),ddLink:getDDLink(r.id)};});sc.sort(function(a,b){return b.score-a.score;});return sc;}catch(e){return[];}}
function top3(sc){if(sc.length<3)return sc.slice(0,3);var w=sc[0],wc=w.r.cat;var b1=sc.slice(1).find(function(s){return s.r.cat!==wc;})||sc[1]||null;if(!b1)return[w];var b2=sc.slice(1).find(function(s){return s.rid!==b1.rid&&s.r.cat!==wc&&s.r.cat!==b1.r.cat;})||sc.find(function(s){return s.rid!==w.rid&&s.rid!==b1.rid;})||sc[2]||null;return[w,b1,b2].filter(Boolean);}

var SK="jfl-v3";function ld(){try{var d=JSON.parse(localStorage.getItem(SK));if(d&&d.p){d.p=d.p.map(function(p){if(p.role&&!p.freq){var rm={primary:"core",kids:"core",extended:"extended",occasional:"occasional"};p.freq=rm[p.role]||"occasional";p.age=p.role==="kids"?"child":"adult";delete p.role;}if(!p.freq)p.freq="occasional";if(!p.age)p.age="adult";if(!p.g){var femIds=["jenna","madi","emmy","jenna-mom","kevin-mom","zoe","leah","tara","amanda","zara"];p.g=femIds.indexOf(p.id)>=0?"f":"m";}return p;});}return d;}catch(e){return null;}}function sv(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){if(e&&e.name==="QuotaExceededError")console.warn("localStorage quota exceeded — data not saved");else console.warn("Save failed:",e);}}

var OBVIOUS_RULES=[
/* Jenna solo — dinner & latenight → Fresh Kitchen */
{sp:["jenna"],spExact:true,rid:"fresh-kitchen",meals:["dinner","latenight"],
callout:"Let's be honest.",ask:"You want Fresh Kitchen, don\u2019t you?",
yes:"Okay. Stop wasting both our time. \uD83E\uDD57",no:"Interesting. Proceed."},
/* Kevin solo — lunch → CFA */
{sp:["kevin"],spExact:true,rid:"chick-fil-a",meals:["lunch"],
callout:"We both know how this ends.",ask:"It\u2019s Chick-fil-A, isn\u2019t it?",
yes:"Called it. \uD83D\uDC14",no:"Who are you right now?"},
/* Kevin solo — breakfast → Wawa */
{sp:["kevin"],spExact:true,rid:"wawa",meals:["breakfast","brunch"],
callout:"Good morning.",ask:"Wawa?",
yes:"Obviously. \u2615",no:"Okay, fancy."},
/* K+J lunch → CFA */
{sp:["kevin","jenna"],spExact:true,rid:"chick-fil-a",meals:["lunch"],
callout:"Be honest with yourselves.",ask:"You\u2019re just going to get Chick-fil-A, right?",
yes:"That\u2019s what we thought. \uD83D\uDC14",no:"Look at you two, being adventurous."},
/* Family of 5 lunch → Jersey Mike's */
{sp:["kevin","jenna","madi","jack","emmy"],spExact:true,rid:"jersey-mikes",meals:["lunch"],
callout:"Five mouths to feed at lunchtime?",ask:"Jersey Mike\u2019s handles this, right?",
yes:"Subs for the whole crew. Easy. \uD83E\uDD6A",no:"Bold. Let\u2019s see what you\u2019ve got."}
];

function getObvious(sel,rests,mctx,rules){
var sp=(sel.sp||[]).slice().sort();
var extras=(sel.xa||0)+(sel.xk||0);
if(extras>0)return null;
var list=rules||OBVIOUS_RULES;
for(var i=0;i<list.length;i++){
var rule=list[i];
if(rule.spExact){
var rsp=rule.sp.slice().sort();
if(JSON.stringify(sp)!==JSON.stringify(rsp))continue;
}
if(rule.meals&&rule.meals.indexOf(mctx.meal)<0)continue;
var rest=rests.find(function(r){return r.id===rule.rid;});
if(!rest||rest.bo)continue;
if(!isOpenNow(rest.id))continue;
if(rest.to<10)continue;
return{rule:rule,rest:rest};
}
return null;
}

function TopBar(p){var isDark=p.theme==="dark"||(p.theme==="auto"&&typeof window!=="undefined"&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);var themeIcon=isDark?"🌙":"☀️";var _ib=isDark?{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)"}:{background:"rgba(0,0,0,.06)",border:"1px solid rgba(0,0,0,.08)"};var _ibs=Object.assign({},_ib,{borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34});return <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)"}}><div style={{display:"flex",alignItems:"center",gap:6,zIndex:1}}>{p.back&&<button onClick={p.back} aria-label="Go back" style={{background:"none",border:"none",color:"var(--tx2)",fontSize:18,cursor:"pointer",padding:"2px 4px 2px 0",fontFamily:"inherit"}}>←</button>}<div onClick={p.onLogo} style={{cursor:p.onLogo?"pointer":"default"}}><div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div><div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div></div></div><div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",padding:"0 90px"}}><div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{p.title||""}</div>{p.sub&&<div style={{fontSize:12,color:"var(--tx3)",marginTop:1}}>{p.sub}</div>}</div><div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>{p.onTheme&&<button onClick={p.onTheme} style={Object.assign({},_ibs,{opacity:.8})}>{themeIcon}</button>}{p.onInfo?<button onClick={p.onInfo} style={_ibs}>{"ℹ️"}</button>:<div style={{width:34}}></div>}</div></div>;}

function BottomNav(p){var go=p.go,active=p.active,setSel=p.setSel;
var tabs=[{id:"dashboard",l:"Dashboard",e:"💎"},{id:"decide",l:"Decide",e:"🎯"},{id:"history",l:"History",e:"📋"},{id:"settings",l:"Settings",e:"⚙️"}];
return <div className="btm-nav" role="tablist" aria-label="Main navigation" style={{display:"flex",alignItems:"center",background:"var(--bg2)",borderTop:"1px solid var(--bdr)",padding:"10px 0 14px",flexShrink:0}}>
{tabs.map(function(t,i){var on=t.id==="decide"?false:active===t.id;return <div key={t.id} style={{display:"contents"}}>{i>0&&<div style={{width:1,height:24,background:"var(--bdr)",opacity:.4,flexShrink:0}}></div>}<button role="tab" aria-selected={on} aria-label={t.l} onClick={function(){if(t.id==="decide"){go("step1");}else{go(t.id);}}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"6px 0",transition:"color .2s, font-weight .2s"}}>
<span style={{fontSize:22}}>{t.e}</span>
<span style={{fontSize:12,fontWeight:on?700:500,color:on?"var(--ac)":"var(--tx3)",transition:"color .2s"}}>{t.l}</span>
</button></div>;})}

  </div>;
}

/* ═══ APP ═══ */
export default function App(){
var saved=useMemo(function(){return ld();},[]);
/* Merge new fields from RESTS defaults into saved restaurants */
var mergedR=useMemo(function(){var base=saved&&saved.r?saved.r:RESTS;var result=base.map(function(r){var def=RESTS.find(function(d){return d.id===r.id;});if(!def)return r;var upd={};if(typeof r.to90==="undefined"&&typeof def.to90!=="undefined")upd.to90=def.to90;if(typeof r.to365==="undefined"&&typeof def.to365!=="undefined")upd.to365=def.to365;if(typeof r.acS==="undefined"&&typeof def.acS!=="undefined")upd.acS=def.acS;if(typeof r.acC==="undefined"&&typeof def.acC!=="undefined")upd.acC=def.acC;if(typeof r.acF==="undefined"&&typeof def.acF!=="undefined")upd.acF=def.acF;if(typeof r.acG==="undefined"&&typeof def.acG!=="undefined")upd.acG=def.acG;if(typeof r.fd==="undefined"&&typeof def.fd!=="undefined")upd.fd=def.fd;if(typeof r.streak==="undefined"&&typeof def.streak!=="undefined")upd.streak=def.streak;if(typeof r.adv==="undefined"&&typeof def.adv!=="undefined"){upd.adv=def.adv;upd.hc=def.hc;upd.sp=def.sp;upd.meat=def.meat;upd.sweet=def.sweet;}return Object.keys(upd).length>0?Object.assign({},r,upd):r;});RESTS.forEach(function(def){if(!result.find(function(r){return r.id===def.id;}))result.push(def);});return result;},[saved]);
var _1=useState(mergedR);var rests=_1[0],setR=_1[1];
var mergedP=useMemo(function(){var base=saved&&saved.p?saved.p:PEOPLE;return base.map(function(p){var def=PEOPLE.find(function(d){return d.id===p.id;});if(!def)return p;var upd={};if(typeof p.adv==="undefined"&&typeof def.adv!=="undefined"){upd.adv=def.adv;upd.hc=def.hc;upd.sp=def.sp;upd.meat=def.meat;upd.sweet=def.sweet;}return Object.keys(upd).length>0?Object.assign({},p,upd):p;});},[saved]);
var _2=useState(mergedP);var ppl=_2[0],setPpl=_2[1];
var _gs=useState(saved&&saved.gs&&typeof saved.gs==="object"&&!Array.isArray(saved.gs)?Object.assign({},GLOBAL_DEFAULTS,saved.gs):Object.assign({},GLOBAL_DEFAULTS));var gs2=_gs[0],setGs2=_gs[1];
var _3=useState(saved&&Array.isArray(saved.h)?saved.h:[]);var hist=_3[0],setH=_3[1];
var _4=useState("landing");var vw=_4[0],go=_4[1];
var _aboutOpen=useState(false);var aboutOpen=_aboutOpen[0],setAboutOpen=_aboutOpen[1];
var _logoConfirm=useState(false);var logoConfirm=_logoConfirm[0],setLogoConfirm=_logoConfirm[1];
var _flav=useState(0);var flavIdx=_flav[0],setFlavIdx=_flav[1];
var HERO_FLAVORS=["67 restaurants. 1 answer.","Let the algorithm decide.","No more scrolling DoorDash.","Your taste profile has opinions."];
useEffect(function(){var t=setInterval(function(){setFlavIdx(function(i){return(i+1)%4;});},6000);return function(){clearInterval(t);};},[]);
var _5=useState(null);var results=_5[0],setRes=_5[1];
var _6=useState(0);var rrc=_6[0],setRrc=_6[1];
var _6b=useState(0);var resIdx=_6b[0],setResIdx=_6b[1];
var _7=useState(false);var busy=_7[0],setBusy=_7[1];
var _8=useState({sp:["kevin","jenna"],mood:"balanced",budget:"normal",speed:"normal",fam:"familiar",ar:false,kf:false,go:false,lo:false,xa:0,xk:0,hf:"all",hfPrev:"all",hrid:null,hsort:"name"});var sel=_8[0],setSel=_8[1];
var selRef=useRef(sel);selRef.current=sel;
var _9=useState(saved&&typeof saved.dr==="string"?saved.dr:"2026-03-21");var dataRefresh=_9[0],setDR=_9[1];
var _10=useState(saved&&Array.isArray(saved.g)?saved.g:GROUPS);var groups=_10[0],setGroups=_10[1];
var _11=useState(saved&&Array.isArray(saved.qr)?saved.qr:null);var qrCustom=_11[0],setQR=_11[1];
var _12=useState(null);var mealOverride=_12[0],setMealOverride=_12[1];
var _13=useState(saved&&saved.mt&&typeof saved.mt==="object"&&!Array.isArray(saved.mt)?saved.mt:null);var customMealTimes=_13[0],setMealTimes=_13[1];
var _14=useState(saved&&Array.isArray(saved.ob)?saved.ob:null);var obvRules=_14[0],setObvRules=_14[1];
var activeObvRules=obvRules||OBVIOUS_RULES;
var _15=useState("90d");var moFilter=_15[0],setMoFilter=_15[1];
var _16=useState(false);var whyOpen=_16[0],setWhyOpen=_16[1];
var _17=useState({});var hExp=_17[0],setHExp=_17[1];
var _nt=useState([]);var sessionSkips=_nt[0],setSessionSkips=_nt[1];
var _ah=useState(null);var alreadyHad=_ah[0],setAlreadyHad=_ah[1];
var _guests=useState([]);var guests=_guests[0],setGuests=_guests[1];
var allPpl=useMemo(function(){return ppl.concat(guests);},[ppl,guests]);
useEffect(function(){sv({r:rests,p:ppl,h:hist,dr:dataRefresh,g:groups,qr:qrCustom,mt:customMealTimes,ob:obvRules,gs:gs2});},[rests,ppl,hist,dataRefresh,groups,qrCustom,customMealTimes,obvRules,gs2]);
useEffect(function(){var t=gs2.theme||"auto";var isDark=t==="dark"||(t==="auto"&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);document.body.style.background=isDark?"#0D1117":"#F5E6E0";},[gs2.theme]);
var mctx=useMemo(function(){return getMealContext(mealOverride,customMealTimes);},[mealOverride,customMealTimes]);
var kidIds=useMemo(function(){return ppl.filter(function(p){return p.age!=="adult";}).map(function(p){return p.id;});},[ppl]);
var up=useCallback(function(k,v){setSel(function(s){var n=Object.assign({},s);n[k]=v;return n;});},[]);
var cycleTheme=useCallback(function(){setGs2(function(prev){var cur=prev.theme||"auto";var isDark=cur==="dark"||(cur==="auto"&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);return Object.assign({},prev,{theme:isDark?"light":"dark"});});},[]);
var setGrp=useCallback(function(pp){var hk=pp.some(function(id){return kidIds.indexOf(id)>=0;});setSel(function(s){return Object.assign({},s,{sp:pp,kf:hk,go:pp.length>4,xa:0,xk:0});});},[kidIds]);
var togP=useCallback(function(id){haptic();setSel(function(s){var has=s.sp.indexOf(id)>=0;var np=has?s.sp.filter(function(i){return i!==id;}):s.sp.concat([id]);var hk=np.some(function(pid){return kidIds.indexOf(pid)>=0;});return Object.assign({},s,{sp:np,kf:hk,go:np.length>4});});},[kidIds]);
var _selWithCtx=useCallback(function(s){return Object.assign({},s,{_alreadyHad:alreadyHad,_sessionSkips:sessionSkips});},[alreadyHad,sessionSkips]);
var _filterSkips=useCallback(function(rr){if(!sessionSkips||sessionSkips.length===0)return rr;return rr.filter(function(r){return sessionSkips.indexOf(r.id)<0;});},[sessionSkips]);
var resolve=useCallback(function(){haptic(15);setBusy(true);setTimeout(function(){var s=_selWithCtx(selRef.current);setRes(top3(scoreAll(_filterSkips(rests),s,allPpl,hist,getMealContext(mealOverride,customMealTimes),gs2)));setRrc(0);setResIdx(0);setBusy(false);go("results");},RESOLVE_DELAY);},[rests,allPpl,hist,mealOverride,customMealTimes,gs2,_selWithCtx,_filterSkips]);
var reroll=useCallback(function(ch){var s=_selWithCtx(selRef.current);var sc=scoreAll(_filterSkips(rests),s,allPpl,hist,getMealContext(mealOverride,customMealTimes),gs2).map(function(x){return Object.assign({},x,{score:x.score+(Math.random()-(ch?0.2:0.4))*(ch?25:15)});});sc.sort(function(a,b){return b.score-a.score;});setRes(top3(sc));setRrc(function(c){return c+1;});setResIdx(0);},[rests,allPpl,hist,mealOverride,customMealTimes,gs2,_selWithCtx,_filterSkips]);
var deadlock=useCallback(function(){var s=selRef.current;var ds=Object.assign({},_selWithCtx(s),{sp:["kevin","jenna"],fam:"safe",mood:"safe-default"});var sc=scoreAll(_filterSkips(rests),ds,allPpl,hist,getMealContext(mealOverride,customMealTimes),gs2);var vwt={low:0,moderate:1,high:2};sc.sort(function(a,b){if(vwt[a.vetoRisk]!==vwt[b.vetoRisk])return vwt[a.vetoRisk]-vwt[b.vetoRisk];return b.score-a.score;});setRes(top3(sc));setRrc(function(c){return c+1;});setResIdx(0);},[rests,ppl,hist,mealOverride,customMealTimes,gs2]);
var pick=useCallback(function(res){haptic(20);var s=selRef.current;setH(function(h){return[{id:Date.now().toString(),rid:res.rid,name:res.r.name,emoji:res.r.emoji,date:new Date().toISOString(),people:s.sp,mood:s.mood,order:res.order,rating:null}].concat(h);});setR(function(rs){return rs.map(function(re){return re.id===res.rid?Object.assign({},re,{to:re.to+1,lo:0,streak:re.streak+1}):re;});});go("dashboard");setRes(null);},[]);
var burn=useCallback(function(id){setR(function(rs){return rs.map(function(r){return r.id===id?Object.assign({},r,{bo:true}):r;});});reroll(false);},[reroll]);
var daysSinceRefresh=Math.floor((Date.now()-new Date(dataRefresh).getTime())/(1000*60*60*24));
var needsRefresh=daysSinceRefresh>=90;
var LANDING_POOL=["🍕","🌮","🍔","🍣","🥗","🍜","🥡","🍗","🌯","🥞","🧇","🍩","🥤","🍦","🥪","🍱","🧆","🥘","🍝","🍳","🥙","🍟","🥓","🧁","🍰"];
var LANDING_ROWS=useMemo(function(){var s=7919;var ri=0;return[[13,22,38,false],[40,28,24,true],[80,18,32,false]].map(function(cfg){var top=cfg[0],sz=cfg[1],dur=cfg[2],rev=cfg[3];var items=[];for(var j=0;j<5;j++){s=(s*16807+ri*5+j)%2147483647;var idx=s%LANDING_POOL.length;items.push({e:LANDING_POOL[idx],sinDelay:-((j*1.3)+(s%10)/10),sinDur:(s=(s*16807)%2147483647)%3+5});}ri++;return{items:items,top:top,sz:sz,dur:dur,rev:rev};});},[]);
var isSoloResult=(sel.sp||[]).length<=1&&!(sel.xa||0)&&!(sel.xk||0);
var vcfg=isSoloResult?{low:{c:"var(--grn)",l:"Strong Match"},moderate:{c:"var(--yel)",l:"Decent Match"},high:{c:"var(--red)",l:"Weak Match"}}:{low:{c:"var(--grn)",l:"Low Veto Risk"},moderate:{c:"var(--yel)",l:"Moderate Risk"},high:{c:"var(--red)",l:"High Risk"}};
var ccfg={high:{l:"High Confidence",c:"var(--grn)"},medium:{l:"Moderate",c:"var(--yel)"},low:{l:"Low",c:"var(--tx3)"}};
var fpData=useMemo(function(){var fpSel={sp:["jenna"],mood:"safe-default",budget:"normal",speed:"normal",fam:"familiar",ar:false,kf:false,go:false,lo:false,_alreadyHad:alreadyHad};var sc=scoreAll(_filterSkips(rests),fpSel,ppl,hist,mctx,gs2);if(!sc||sc.length<1)return null;var fp=sc[0];if(fp.score<55)return null;var gap=sc.length>1?(fp.score-sc[1].score):20;var prob=gap>15?"High likelihood":gap>8?"Probable choice":"Possible choice";return{fp:fp,prob:prob};},[rests,ppl,hist,mctx,gs2,alreadyHad,_filterSkips]);

/* Top bar shared across all views */
var _lt=gs2.theme||"auto";var isDk=_lt==="dark"||(_lt==="auto"&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);

return(
<div className={"jfl-root theme-"+(gs2.theme||"auto")}>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>{CSS}</style>


  {busy&&(function(){var bm=MOODS.find(function(m){return m.id===sel.mood;})||{emoji:"\u2696\uFE0F",label:"Balanced"};return <div className="jfl-overlay"><div className="tada" style={{fontSize:48,marginBottom:8}}>{bm.emoji}</div><div className="pop" style={{color:"var(--tx1)",fontWeight:700,fontSize:16,animationDelay:".15s"}}>{bm.label}</div><div className="spin" style={{width:24,height:24,border:"2px solid var(--bdr)",borderTopColor:"var(--ac)",borderRadius:"50%",marginTop:16}}></div><div className="pop" style={{color:"var(--tx3)",fontSize:11,marginTop:12,animationDelay:".3s"}}>Finding your perfect match...</div></div>;})()}

  {/* ── About panel overlay (renders on all screens) ── */}
  {aboutOpen&&(function(){var _abt=gs2.theme||"auto";var _abDk=_abt==="dark"||(_abt==="auto"&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);return <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999,display:"flex",justifyContent:"flex-end"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:_abDk?"rgba(0,0,0,.7)":"rgba(0,0,0,.3)",backdropFilter:"blur(4px)",cursor:"pointer"}} onClick={function(){setAboutOpen(false);}}></div>
    <div className="slide-in" style={{position:"relative",width:"85%",maxWidth:340,background:_abDk?"linear-gradient(180deg,#0D1117 0%,#131920 40%,#161B22 100%)":"linear-gradient(180deg,#FAF0EC 0%,#F5E6E0 40%,#F0DDD6 100%)",height:"100%",overflow:"auto",boxShadow:_abDk?"-8px 0 40px rgba(0,0,0,.5)":"-8px 0 40px rgba(0,0,0,.12)",borderLeft:_abDk?"1px solid rgba(244,114,182,.08)":"1px solid rgba(200,150,130,.2)"}}>
      <button onClick={function(){setAboutOpen(false);}} style={{position:"absolute",top:16,right:16,background:_abDk?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)",border:_abDk?"1px solid rgba(255,255,255,.08)":"1px solid rgba(0,0,0,.08)",borderRadius:20,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",zIndex:1}} aria-label="Close">{"\u2715"}</button>
      <div style={{padding:"40px 20px 24px",textAlign:"center",background:_abDk?"radial-gradient(ellipse at 50% 0%,rgba(244,114,182,.08) 0%,transparent 70%)":"radial-gradient(ellipse at 50% 0%,rgba(201,26,94,.06) 0%,transparent 70%)"}}>
        <div style={{fontSize:32,fontWeight:800,letterSpacing:-1,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--tx2)",marginTop:3,letterSpacing:2,textTransform:"uppercase"}}>Food Logic</div>
        <div style={{fontSize:12,color:"var(--tx2)",marginTop:10}}>by Madden Frameworks</div>
        <div style={{fontSize:14,color:"var(--tx2)",marginTop:20,lineHeight:"1.6",textAlign:"center"}}>{"A decision engine for the nightly "}<span style={{color:"var(--ac)",fontWeight:600,fontStyle:"italic",whiteSpace:"nowrap"}}>{"\"what should we eat?\""}</span>{" debate."}</div>
      </div>
      <div style={{padding:"0 20px"}}>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:20,height:1,background:"var(--ac)",opacity:.5}}></div><span style={{fontSize:10,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:1.5}}>How it works</span></div>
          <div style={{fontSize:12,color:"var(--tx2)",lineHeight:"1.7"}}>{"Pick who\u2019s eating. Answer a few quick questions together. The app reads your mood, weighs everyone\u2019s preferences, checks your order history, and picks the restaurant that fits best. If you can\u2019t agree, it triggers a head-to-head tiebreaker."}</div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:20,height:1,background:"var(--grn)",opacity:.5}}></div><span style={{fontSize:10,fontWeight:700,color:"var(--grn)",textTransform:"uppercase",letterSpacing:1.5}}>What it knows</span></div>
          <div style={{fontSize:12,color:"var(--tx2)",lineHeight:"1.7"}}>{"DoorDash order history, taste preferences for each person, restaurant scores across 8 dimensions, meal timing, day-of-week patterns, and budget."}</div>
          <div style={{fontSize:11,color:"var(--tx2)",fontStyle:"italic",marginTop:4,whiteSpace:"nowrap"}}>{"Data-driven \u2014 no random picks."}</div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:20,height:1,background:"var(--ac)",opacity:.5}}></div><span style={{fontSize:10,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:1.5}}>Why it exists</span></div>
          <div style={{fontSize:12,color:"var(--tx2)",lineHeight:"1.7"}}>{"Because families spend too much time arguing about what to order and not enough time enjoying the meal together."}</div>
          <div style={{fontSize:12,color:"var(--tx1)",fontWeight:600,marginTop:6}}>{"Now the algorithm handles the hard part."}</div>
        </div>
      </div>
      <div style={{padding:"16px 20px",background:_abDk?"rgba(255,255,255,.02)":"rgba(0,0,0,.03)",borderTop:_abDk?"1px solid rgba(255,255,255,.04)":"1px solid rgba(0,0,0,.06)",borderBottom:_abDk?"1px solid rgba(255,255,255,.04)":"1px solid rgba(0,0,0,.06)",display:"flex",gap:0}}>
        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:"var(--ac)"}}>Unlimited</div><div style={{fontSize:10,color:"var(--tx1)",marginTop:3}}>possibilities</div></div>
        <div style={{width:1,background:_abDk?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}}></div>
        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:"var(--grn)"}}>Endless</div><div style={{fontSize:10,color:"var(--tx1)",marginTop:3}}>opinions</div></div>
        <div style={{width:1,background:_abDk?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}}></div>
        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:"var(--tx1)"}}>One</div><div style={{fontSize:10,color:"var(--tx1)",marginTop:3}}>clear choice</div></div>
      </div>
      <div style={{padding:"28px 20px 40px",textAlign:"center"}}>
        <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",letterSpacing:3,textTransform:"uppercase"}}>Madden Frameworks</div>
        <div style={{fontSize:11,color:"var(--tx2)",marginTop:5,fontStyle:"italic"}}>Stop overthinking dinner.</div>
        <div style={{fontSize:9,color:"var(--tx3)",marginTop:14}}>{"\u00A9 2026 Madden Frameworks"}</div>
      </div>
    </div>
  </div>;})()}

  {logoConfirm&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)",cursor:"pointer"}} onClick={function(){setLogoConfirm(false);}}></div>
    <div className="pop" style={{position:"relative",background:"var(--bg1)",border:"1px solid var(--bdr)",borderRadius:16,padding:"24px 20px",width:"85%",maxWidth:300,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:12}}>🏠</div>
      <div style={{fontSize:16,fontWeight:700,color:"var(--tx1)",marginBottom:6}}>Back to start?</div>
      <div style={{fontSize:13,color:"var(--tx2)",marginBottom:20,lineHeight:"1.5"}}>This will take you back to the welcome screen.</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={function(){setLogoConfirm(false);}} style={{flex:1,padding:12,borderRadius:10,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx2)",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Stay</button>
        <button onClick={function(){setLogoConfirm(false);go("landing");setRes(null);}} className="jfl-cta" style={{flex:1,padding:12,borderRadius:10,fontSize:14,fontWeight:600}}>Go back</button>
      </div>
    </div>
  </div>}

{/* ═══ LANDING ═══ */}
  {vw==="landing"&&(function(){
    var ROWS=LANDING_ROWS;
    var cardStyle=isDk?{background:"rgba(255,255,255,.02)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,.08)"}:{background:"rgba(255,255,255,.55)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,.6)",boxShadow:"0 4px 24px rgba(120,40,60,.08)"};
    var emojiOp=isDk?0.45:0.55;
    return <div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh",background:"var(--bg0)",overflow:"hidden",position:"relative"}}>

    {/* ── emoji rows ── */}
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",animation:"emojiFadeIn 1.5s ease-out both"}}>
      {ROWS.map(function(row,ri){
        var content=row.items.map(function(item,ei){return <span key={ei} style={{display:"inline-block",fontSize:row.sz,padding:"0 40px",animation:"emojiSine"+ri%3+" "+item.sinDur+"s ease-in-out "+item.sinDelay+"s infinite"}}>{item.e}</span>;});
        var rowOp=[emojiOp*0.7,emojiOp,emojiOp*0.55][ri]||emojiOp;
        return <div key={ri} style={{position:"absolute",top:row.top+"%",left:0,whiteSpace:"nowrap",opacity:rowOp}}>
          <div style={{display:"inline-block",animation:"emojiScroll "+row.dur+"s linear infinite",animationDirection:row.rev?"reverse":"normal"}}>
            {content}{content}
          </div>
        </div>;
      })}
    </div>

    {/* ── top bar ── */}
    <div style={{padding:"12px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"relative",zIndex:1}}>
      <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:2,textTransform:"uppercase"}}>A Madden Frameworks Solution</div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={cycleTheme} style={{background:isDk?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",border:isDk?"1px solid rgba(255,255,255,.1)":"1px solid rgba(0,0,0,.08)",borderRadius:10,padding:6,cursor:"pointer",fontSize:18,opacity:.8,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34}}>{(function(){var _d=gs2.theme==="dark"||((!gs2.theme||gs2.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);return _d?"\uD83C\uDF19":"\u2600\uFE0F";})()}</button>
        <button onClick={function(){setAboutOpen(true);}} style={{background:isDk?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",border:isDk?"1px solid rgba(255,255,255,.1)":"1px solid rgba(0,0,0,.08)",borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34}}>{"ℹ️"}</button>
      </div>
    </div>

    {/* ── main content ── */}
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"0 20px",position:"relative",zIndex:1,textAlign:"center",gap:12}}>

      {/* logo card */}
      <div style={Object.assign({},cardStyle,{borderRadius:20,padding:"28px 28px 24px",width:"100%",maxWidth:340})}>
        <div style={{animation:"tada .8s ease-out both"}}>
          <div style={{fontSize:56,fontWeight:800,letterSpacing:-2.5,lineHeight:1,textShadow:"0 0 40px rgba(244,114,182,.3)"}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div>
          <div style={{fontSize:16,fontWeight:900,color:"var(--tx2)",marginTop:8,letterSpacing:4,textTransform:"uppercase"}}>Food Logic</div>
        </div>
        <div style={{marginTop:20,padding:"10px 16px",borderRadius:12,background:isDk?"rgba(255,255,255,.04)":"rgba(0,0,0,.05)"}}>
          <div style={{height:20,position:"relative",overflow:"hidden",width:"100%"}}>
            <div key={flavIdx} className="slot-roll" style={{fontSize:14,fontWeight:500,color:"var(--ac)",fontStyle:"italic",opacity:.85}}>{["End the debate.","No more scrolling DoorDash.","Your taste profile has opinions.","Vibes in. Answer out."][flavIdx%4]}</div>
          </div>
        </div>
      </div>

      {/* how-it-works flow */}
      <div style={Object.assign({},cardStyle,{borderRadius:20,padding:"16px 20px",width:"100%",maxWidth:340})}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0}}>
          {[{e:"👥",l:"Crew"},{e:"✨",l:"Vibes"},{e:"🍽️",l:"Yum"}].map(function(step,si){
            return <React.Fragment key={si}>
              {si>0&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,animation:"symFill"+si+" 6s ease-in-out infinite"}}><span style={{fontSize:28,fontWeight:800,color:"var(--ac)"}}>{si===1?"+":"="}</span></div>}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:60}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:isDk?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,animation:"stepOn"+si+" 6s ease-in-out infinite"+(si===2?", yumSparkle 6s ease-in-out infinite":"")}}>{step.e}</div>
                <span style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:.5,textTransform:"uppercase",animation:"labelOn"+si+" 6s ease-in-out infinite"}}>{step.l}</span>
              </div>
            </React.Fragment>;
          })}
        </div>
      </div>

      {/* CTA */}
      <button className="jfl-cta landingPulse" style={{padding:"18px 40px",fontSize:18,fontWeight:700,width:"100%",maxWidth:340,borderRadius:16}} onClick={function(){go("dashboard");}}>
        <span>{"What should we order? \u2192"}</span>
      </button>
    </div>

    {/* ── footer ── */}
    <div style={{padding:"8px 28px 16px",textAlign:"center",flexShrink:0,position:"relative",zIndex:1}}>
      <div style={{fontSize:9,fontWeight:700,color:"var(--tx3)",letterSpacing:2,textTransform:"uppercase",opacity:.5}}>{"\u00A9 2026 Madden Frameworks"}</div>
      <div style={{fontSize:11,color:"var(--tx3)",marginTop:3,fontStyle:"italic",opacity:.4}}>{"Smart systems. Full stomachs."}</div>
    </div>
  </div>;})()}

{/* HOME */}
  {vw==="dashboard"&&<div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
    {/* ── Branded header ── */}
    <div style={{position:"relative",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div onClick={function(){setLogoConfirm(true);}} style={{cursor:"pointer",zIndex:1}}>
        <div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div>
        <div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div>
      </div>
      <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:2,textTransform:"uppercase"}}>Madden Frameworks</div>
      <div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>
        <button onClick={cycleTheme} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:6,cursor:"pointer",fontSize:18,opacity:.8,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34}}>{(function(){var _d=gs2.theme==="dark"||((!gs2.theme||gs2.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);return _d?"🌙":"☀️";})()}</button>
        <button onClick={function(){setAboutOpen(true);}} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34}}>{"ℹ️"}</button>
      </div>
    </div>

    {/* ── Main content ── */}
    <div style={{flex:1,padding:"6px 16px 0",display:"flex",flexDirection:"column",gap:6,overflow:"auto"}}>

      {/* ── Meal selector ── */}
      {(function(){var meals=[{id:"breakfast",l:"Brkfst"},{id:"brunch",l:"Brunch"},{id:"lunch",l:"Lunch"},{id:"dinner",l:"Dinner"},{id:"latenight",l:"Late"}];
        return <div style={{display:"flex",gap:4}}>
          {meals.map(function(m){var on=mctx.meal===m.id;return <button key={m.id} onClick={function(){setMealOverride(mctx.meal===m.id?null:m.id);}} style={{flex:1,padding:"5px 0",borderRadius:8,border:on?"1px solid var(--ac)":"1px solid var(--bdr)",background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:on?700:600,cursor:"pointer",fontFamily:"inherit",transition:"all .12s",textAlign:"center"}}>
            {m.l}
          </button>;})}
        </div>;})()}

      {needsRefresh&&<div style={{background:"rgba(251,191,36,.1)",border:"1px solid rgba(251,191,36,.3)",borderRadius:8,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12}}>⚠</span><div style={{fontSize:11,color:"var(--yel)",fontWeight:600}}>{"Data refresh recommended · Last import: "+dataRefresh}</div></div>}

      {/* ── Fast Path card ── */}
      {fpData&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{mood:"safe-default",budget:"normal",speed:"normal",fam:"familiar",kf:true});});go("quickpick");}} className="jfl-card float-in" style={{cursor:"pointer",padding:"10px 14px",border:"1px solid rgba(244,114,182,.25)",background:"rgba(244,114,182,.04)",textAlign:"left",width:"100%",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,animationDelay:".15s"}}>
          <span style={{fontSize:11,color:"var(--ac)"}}>●</span>
          <span style={{fontSize:12,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:.5}}>{fpData.prob}</span>
          <span style={{fontSize:20}}>{fpData.fp.r.emoji}</span>
          <span style={{fontSize:14,fontWeight:700,color:"var(--tx1)",flex:1}}>{fpData.fp.r.sn||fpData.fp.r.name}</span>
          <span style={{fontSize:12,color:"var(--tx3)",fontWeight:500}}>Tap to go →</span>
        </button>}

      {/* ── Hero CTA ── */}
      <div style={{display:"flex",gap:8}}>
      <button className="jfl-cta jfl-cta-hero" style={{flex:3}} onClick={function(){go("step1");}}>
        <span style={{fontSize:15,fontWeight:700,textShadow:"0 1px 4px rgba(0,0,0,.25)"}}>{mctx.cta}</span>
        <span key={flavIdx} className="float-in" style={{fontSize:11,fontWeight:500,opacity:.8,marginTop:2,textShadow:"0 1px 3px rgba(0,0,0,.3)"}}>{HERO_FLAVORS[flavIdx]}</span>
      </button>
      <button className="jfl-cta" style={{flex:1,padding:"10px 8px",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}} onClick={function(){setSel(function(s){return Object.assign({},s,{sp:["kevin","jenna"],mood:"roulette",budget:"normal",speed:"normal",fam:"surprise",kf:false,go:false,xa:0,xk:0});});setBusy(true);setTimeout(function(){var surpriseSel={sp:["kevin","jenna"],mood:"roulette",budget:"normal",speed:"normal",fam:"surprise",kf:false,go:false,xa:0,xk:0,_alreadyHad:alreadyHad,_sessionSkips:sessionSkips};setRes(top3(scoreAll(_filterSkips(rests),surpriseSel,allPpl,hist,mctx,gs2)));setRrc(0);setResIdx(0);setBusy(false);go("results");},RESOLVE_DELAY);}} aria-label="Surprise me" title="Surprise me"><span style={{fontSize:22}}>{"\uD83C\uDFB2"}</span><span style={{fontSize:11,fontWeight:700,opacity:.9}}>Surprise</span></button>
      </div>

      {/* ── Quick Resolve ── */}
      {(function(){var mc=mctx;var src=(qrCustom&&qrCustom.length>0)?qrCustom:QR_DEFAULTS;var visible=src.filter(function(q){return !q.meals||q.meals.length===0||q.meals.indexOf(mc.meal)>=0||(mc.meal==="brunch"&&q.meals.indexOf("breakfast")>=0);}).slice(0,4);if(visible.length===0)return null;return <div className="jfl-card" style={{padding:"8px 10px"}}>
        <div className="jfl-label" style={{marginBottom:6,display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:1,background:"var(--ac)",opacity:.5}}></div>Quick Resolves</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {visible.map(function(q,i){var names=q.g.map(function(id){var p=ppl.find(function(pp){return pp.id===id;});return p?p.name.split(" ")[0]:id;});var jIdx=names.indexOf("Jenna");if(jIdx>0){names.splice(jIdx,1);names.unshift("Jenna");}var sub=names.length>3?names.slice(0,2).join(" & ")+" +"+String(names.length-2):names.length===2?names.join(" & "):names.length===3?names[0]+", "+names[1]+" & "+names[2]:names[0]||"";return <button key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg1)",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}} onClick={function(){var hk=q.g.some(function(id){return kidIds.indexOf(id)>=0;});setSel(function(s){return Object.assign({},s,{sp:q.g,mood:q.m,kf:hk,go:q.g.length>4,xa:0,xk:0,qrLabel:q.l,qrEmoji:q.e});});go("qrConfirm");}}><span style={{fontSize:16}}>{q.e}</span><div><div style={{fontSize:12,fontWeight:600,color:"var(--tx2)"}}>{q.l}</div><div style={{fontSize:10,color:"var(--tx3)",marginTop:1}}>{sub}</div></div></button>;})}
        </div>
      </div>;})()}

      {/* ── Most Ordered podium with filters ── */}
      {(function(){var gCt=function(r){if(moFilter==="90d")return typeof r.to90==="number"?r.to90:(r.lo<90?r.to:0);if(moFilter==="365d")return typeof r.to365==="number"?r.to365:(r.lo<365?r.to:0);return r.to;};var sorted=rests.slice().filter(function(r){return gCt(r)>0;}).sort(function(a,b){return gCt(b)-gCt(a);});var top=sorted.slice(0,3);
        /* Compute date range from most recent ld */
        var latestLd=null;rests.forEach(function(r){if(r.ld&&(!latestLd||r.ld>latestLd))latestLd=r.ld;});
        var rangeText="";var rangeLabel="";if(latestLd){var ld=new Date(latestLd+"T12:00:00");var mons=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var fmtNice=function(d){return mons[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();};if(moFilter==="90d"){var from=new Date(ld.getTime()-90*86400000);rangeLabel="90 days";rangeText=fmtNice(from)+" \u2013 "+fmtNice(ld);}else if(moFilter==="365d"){var from=new Date(ld.getTime()-365*86400000);rangeLabel="365 days";rangeText=fmtNice(from)+" \u2013 "+fmtNice(ld);}else{var earliest=null;rests.forEach(function(r){var d=r.fd||r.ld;if(d&&r.to>0&&(!earliest||d<earliest))earliest=d;});if(earliest){var ef=new Date(earliest+"T12:00:00");var diffMs=ld.getTime()-ef.getTime();var diffDays=Math.floor(diffMs/86400000);var yy=Math.floor(diffDays/365);var rem=diffDays%365;var mm=Math.floor(rem/30);var dd=rem%30;var parts=[];if(yy>0)parts.push(yy+(yy===1?" year":" years"));if(mm>0)parts.push(mm+(mm===1?" month":" months"));if(dd>0)parts.push(dd+(dd===1?" day":" days"));rangeLabel=parts.join(", ")||"0 days";rangeText=fmtNice(ef)+" \u2013 "+fmtNice(ld);}}}
        return <div className="jfl-card" style={{padding:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div className="jfl-label" style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:1,background:"var(--grn)",opacity:.5}}></div>Most ordered</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {["90d","365d","all"].map(function(f){return <button key={f} onClick={function(){setMoFilter(f);}} style={{padding:"3px 10px",borderRadius:12,border:"1px solid "+(moFilter===f?"var(--ac)":"var(--bdr)"),background:moFilter===f?"rgba(244,114,182,.1)":"transparent",color:moFilter===f?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{f==="90d"?"Recently":f==="365d"?"Past Year":"All Time"}</button>;})}
            </div>
          </div>
          {rangeLabel&&<div style={{textAlign:"center",marginBottom:6,padding:"5px 0",borderTop:"1px solid var(--bdr)",borderBottom:"1px solid var(--bdr)",lineHeight:"1.4",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span style={{fontSize:11,fontWeight:700,color:"var(--tx2)"}}>{rangeLabel}</span>{rangeText&&<span style={{fontSize:10,color:"var(--tx3)"}}>{rangeText}</span>}</div>}
          {top[0]?<div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8}}>
            {top[1]&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:"all",hrid:top[1].id});});go("history");}} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
              <span style={{fontSize:12,fontWeight:700,color:"#A8B4C0"}}>2nd</span>
              <div style={{background:"var(--bg2)",borderRadius:10,padding:"10px 4px",width:"100%",textAlign:"center",border:"1px solid #A8B4C0",marginTop:3,boxShadow:"0 1px 6px rgba(168,180,192,.1)"}}>
                <span className="podium-pop" style={{fontSize:22,display:"inline-block",animationDelay:".3s"}}>{top[1].emoji}</span>
                <div style={{fontSize:11,fontWeight:600,color:"var(--tx2)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{top[1].sn||top[1].name}</div>
                <div style={{fontSize:12,fontWeight:700,color:"#A8B4C0"}}>{gCt(top[1])}</div>
              </div>
            </button>}
            <button onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:"all",hrid:top[0].id});});go("history");}} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1.15,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
              <span className="crown-glow" style={{fontSize:14,fontWeight:700,color:"var(--yel)"}}>{"\uD83C\uDFC6"}</span>
              <div style={{background:"var(--bg2)",borderRadius:10,padding:"10px 4px",width:"100%",textAlign:"center",border:"2px solid var(--ac)",marginTop:3,boxShadow:"0 2px 10px rgba(244,114,182,.12)"}}>
                <span className="podium-pop" style={{fontSize:30,display:"inline-block",animationDelay:".15s"}}>{top[0].emoji}</span>
                <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{top[0].sn||top[0].name}</div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--ac)",marginTop:1}}>{gCt(top[0])}</div>
              </div>
            </button>
            {top[2]&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:"all",hrid:top[2].id});});go("history");}} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
              <span style={{fontSize:12,fontWeight:700,color:"#B8976A"}}>3rd</span>
              <div style={{background:"var(--bg2)",borderRadius:10,padding:"10px 4px",width:"100%",textAlign:"center",border:"1px solid #B8976A",marginTop:3,boxShadow:"0 1px 6px rgba(184,151,106,.06)"}}>
                <span className="podium-pop" style={{fontSize:20,display:"inline-block",animationDelay:".45s"}}>{top[2].emoji}</span>
                <div style={{fontSize:11,fontWeight:600,color:"#B8976A",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{top[2].sn||top[2].name}</div>
                <div style={{fontSize:12,fontWeight:700,color:"#B8976A"}}>{gCt(top[2])}</div>
              </div>
            </button>}
          </div>:<div style={{textAlign:"center",padding:"16px 0",color:"var(--tx3)",fontSize:12}}>No orders in this window</div>}
        </div>;})()}

      {/* ── Stats row ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <button className="jfl-stat float-in" onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"favs"});});go("history");}} style={{cursor:"pointer",padding:"8px 6px",borderTop:"2px solid var(--ac)",animationDelay:".2s"}}><div style={{fontSize:18,fontWeight:700,background:"linear-gradient(135deg,#F472B6,#E8458A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{rests.filter(function(r){return r.fav;}).length}</div><div className="jfl-stat-l">Favorites</div></button>
        <button className="jfl-stat float-in" onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"active"});});go("history");}} style={{cursor:"pointer",padding:"8px 6px",borderTop:"2px solid var(--grn)",animationDelay:".3s"}}><div style={{fontSize:18,fontWeight:700,background:isDk?"linear-gradient(135deg,#D4A574,#C4956A)":"linear-gradient(135deg,#A07828,#8A6520)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{rests.filter(function(r){return!r.bo;}).length}</div><div className="jfl-stat-l">In Rotation</div></button>
        <button className="jfl-stat float-in" onClick={function(){go("history");}} style={{cursor:"pointer",padding:"8px 6px",borderTop:"2px solid",borderImage:"linear-gradient(135deg,#F472B6,#C4956A) 1",animationDelay:".4s"}}><div style={{fontSize:18,fontWeight:700,background:"linear-gradient(135deg,#F472B6,#C4956A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{rests.reduce(function(s,r){return s+r.to;},0)}</div><div className="jfl-stat-l">Total Orders</div></button>
      </div>

      {/* ── Smart nudges ── */}
      {(function(){var nudges=[];/* Cuisine diversity */var recent=hist.slice(0,8);if(recent.length>=4){var cats={};recent.forEach(function(h){var r=rests.find(function(x){return x.id===h.rid;});if(r&&r.cat){cats[r.cat]=(cats[r.cat]||0)+1;}});Object.keys(cats).forEach(function(c){if(cats[c]>=3){var cName={"fast-food":"fast food","fast-casual":"fast casual","casual-dining":"casual dining","coffee-snack":"coffee & snacks"}[c]||c;nudges.push({e:"\uD83D\uDD01",t:"You\u2019ve had "+cName+" "+cats[c]+" of your last "+recent.length+" orders. Mix it up?"});}});}/* DOW insight */var today=new Date().getDay();var dayName=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today];var todayHist=hist.filter(function(h){return new Date(h.date).getDay()===today;});if(todayHist.length>=3){var topRid=null,topCt=0,ridCt={};todayHist.forEach(function(h){ridCt[h.rid]=(ridCt[h.rid]||0)+1;if(ridCt[h.rid]>topCt){topCt=ridCt[h.rid];topRid=h.rid;}});if(topCt>=2){var tr=rests.find(function(x){return x.id===topRid;});if(tr)nudges.push({e:tr.emoji,t:tr.sn||tr.name+" is your go-to "+dayName+" pick."});}}/* Anniversary callouts */var todayStr=new Date().toISOString().slice(5,10);hist.forEach(function(h){if(!h.date)return;var hd=h.date.slice(5,10);var hy=parseInt(h.date.slice(0,4));var cy=new Date().getFullYear();if(hd===todayStr&&hy<cy){var yrs=cy-hy;nudges.push({e:"\uD83C\uDF82",t:yrs+(yrs===1?" year":" years")+" ago today you first ordered from "+h.name+"."});}});if(nudges.length<1)return null;var nudge=nudges[0];return <div className="jfl-card float-in" style={{padding:"8px 12px",display:"flex",alignItems:"center",gap:8,animationDelay:".5s"}}>
        <span style={{fontSize:16}}>{nudge.e}</span>
        <span style={{fontSize:11,fontWeight:500,color:"var(--tx2)",flex:1,lineHeight:"1.4"}}>{nudge.t}</span>
      </div>;})()}

    </div>

    <BottomNav go={go} active="dashboard" setSel={setSel}/>
  </div>}
    {/* ═══ STEP 1 ═══ */}
  {vw==="step1"&&<div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
    <TopBar title="Who's eating?" back={function(){go("dashboard");}}  onTheme={cycleTheme} theme={gs2.theme||"auto"} onInfo={function(){setAboutOpen(true);}} onLogo={function(){setLogoConfirm(true);}}/>
    <div style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <div className="jfl-label" style={{marginBottom:8}}>Quick select</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {groups.filter(function(g){return g.id==="couple"||g.id==="family";}).map(function(g){var on=JSON.stringify(sel.sp.slice().sort())===JSON.stringify(g.people.slice().sort());return <button key={g.id} className={on?"jfl-chip on":"jfl-chip"} onClick={function(){setGrp(g.people);}}><span style={{fontSize:18}}>{g.emoji}</span><span>{g.name}</span></button>;})}
      </div>
      {sel._showAllGroups&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        {groups.filter(function(g){return g.id!=="couple"&&g.id!=="family";}).map(function(g){var on=JSON.stringify(sel.sp.slice().sort())===JSON.stringify(g.people.slice().sort());return <button key={g.id} className={on?"jfl-chip on":"jfl-chip"} onClick={function(){setGrp(g.people);}}><span style={{fontSize:18}}>{g.emoji}</span><span>{g.name}</span></button>;})}
      </div>}
      {!sel._showAllGroups&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{_showAllGroups:true});});}} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:500,color:"var(--tx3)",padding:0,textAlign:"left"}}>{groups.length-2+" more groups \u203A"}</button>}
      <div className="jfl-label" style={{marginTop:14,marginBottom:8}}>Or pick individually</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {(function(){var po=["kevin","jenna","madi","jack","emmy","jenna-mom","jenna-dad","kevin-mom","zoe","derek","wyatt","beckham","zara","leah","corey","tara","tyler","amanda"];var sorted=ppl.slice().sort(function(a,b){var ai=po.indexOf(a.id),bi=po.indexOf(b.id);if(ai<0)ai=999;if(bi<0)bi=999;return ai-bi;});var core=sorted.filter(function(p){return["kevin","jenna","madi","jack","emmy"].indexOf(p.id)>=0;});var rest=sorted.filter(function(p){return["kevin","jenna","madi","jack","emmy"].indexOf(p.id)<0;});var visible=sel._showAllPeople?sorted:core.concat(rest.filter(function(p){return sel.sp.indexOf(p.id)>=0;}));return visible;})().map(function(p){var on=sel.sp.indexOf(p.id)>=0;return <button key={p.id} className={on?"jfl-pill on":"jfl-pill"} onClick={function(){togP(p.id);}}>{p.emoji+" "+p.name}</button>;})}
        {!sel._showAllPeople&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{_showAllPeople:true});});}} style={{padding:"6px 12px",borderRadius:20,border:"1px dashed var(--bdr)",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:500,color:"var(--tx3)"}}>{ppl.length-5+" more \u203A"}</button>}
      </div>
      {sel.sp.length>0&&<div style={{marginTop:12,fontSize:12,color:"var(--tx3)",fontWeight:500}}>{sel.sp.length+(sel.xa||sel.xk?("+"+(sel.xa+sel.xk)):"")+" people"+(sel.kf||sel.xk>0?" \u00B7 Kid-safe active":"")}</div>}
      <div style={{marginTop:12}}>
        <div className="jfl-label" style={{marginBottom:10}}>Extra guests?</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--bg1)",borderRadius:10,padding:"8px 12px",border:"1px solid var(--bdr)"}}>
            <span style={{fontSize:14}}>{"\uD83E\uDDD1"}</span>
            <span style={{fontSize:11,fontWeight:500,color:"var(--tx2)",flex:1}}>Adults</span>
            <button className="jfl-btn" aria-label="Decrease extra adults" style={{width:36,height:36,padding:0,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setSel(function(s){return Object.assign({},s,{xa:Math.max(0,(s.xa||0)-1)});});}}>−</button>
            <span style={{fontSize:14,fontWeight:700,color:"var(--tx1)",minWidth:16,textAlign:"center"}}>{sel.xa||0}</span>
            <button className="jfl-btn" aria-label="Increase extra adults" style={{width:36,height:36,padding:0,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setSel(function(s){return Object.assign({},s,{xa:(s.xa||0)+1});});}}>+</button>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--bg1)",borderRadius:10,padding:"8px 12px",border:"1px solid var(--bdr)"}}>
            <span style={{fontSize:14}}>{"\uD83E\uDDD2"}</span>
            <span style={{fontSize:11,fontWeight:500,color:"var(--tx2)",flex:1}}>Kids</span>
            <button className="jfl-btn" aria-label="Decrease extra kids" style={{width:36,height:36,padding:0,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setSel(function(s){return Object.assign({},s,{xk:Math.max(0,(s.xk||0)-1)});});}}>−</button>
            <span style={{fontSize:14,fontWeight:700,color:"var(--tx1)",minWidth:16,textAlign:"center"}}>{sel.xk||0}</span>
            <button className="jfl-btn" aria-label="Increase extra kids" style={{width:36,height:36,padding:0,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setSel(function(s){return Object.assign({},s,{xk:(s.xk||0)+1});});}}>+</button>
          </div>
        </div>
      </div>
      {/* ── Guest profiles ── */}
      {guests.length>0&&<div style={{marginTop:12}}>
        <div className="jfl-label" style={{marginBottom:6}}>Guests</div>
        {guests.map(function(g){var gOn=sel.sp.indexOf(g.id)>=0;return <div key={g.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,border:"1px solid "+(gOn?"var(--ac)":"var(--bdr)"),background:gOn?"rgba(244,114,182,.06)":"var(--bg1)",marginBottom:4}}>
          <button onClick={function(){togP(g.id);}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:gOn?"var(--ac)":"var(--tx2)",flex:1,textAlign:"left",padding:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{g.emoji+" "+g.name+(gOn?" \u2713":"")}</button>
          <span style={{fontSize:9,color:"var(--tx3)"}}>{g.adv>=.7?"adventurous":g.adv<=.3?"picky":"moderate"}{g.sp>=.7?" \u00B7 loves spice":g.sp<=.2?" \u00B7 no spice":""}</span>
          <button aria-label={"Remove "+g.name} onClick={function(){setGuests(function(gs){return gs.filter(function(x){return x.id!==g.id;});});setSel(function(s){return Object.assign({},s,{sp:s.sp.filter(function(id){return id!==g.id;})});});}} style={{background:"none",border:"none",color:"var(--tx3)",cursor:"pointer",fontSize:12,padding:"2px 4px",fontFamily:"inherit"}}>{"\u2715"}</button>
        </div>;})}
      </div>}
      <button onClick={function(){var gid="guest-"+Date.now();var guestN=guests.length+1;setGuests(function(gs){return gs.concat([{id:gid,name:"Guest "+guestN,emoji:"\uD83D\uDE42",freq:"occasional",age:"adult",g:"m",adv:.5,hc:.5,sp:.5,meat:.5,sweet:.5}]);});setSel(function(s){return Object.assign({},s,{sp:s.sp.concat([gid]),_guestEdit:gid});});}} style={{marginTop:8,padding:"8px 12px",borderRadius:8,border:"1px dashed var(--bdr)",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,color:"var(--tx3)",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{"+ Add a guest"}</button>
      {guests.length>0&&sel._guestEdit&&(function(){var ge=guests.find(function(g){return g.id===sel._guestEdit;});if(!ge)return null;return <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <input type="text" aria-label="Guest name" value={ge.name} onChange={function(e){var v=e.target.value;setGuests(function(gs){return gs.map(function(g){return g.id===ge.id?Object.assign({},g,{name:v}):g;});});}} style={{flex:1,padding:"4px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontWeight:600,fontFamily:"inherit"}}/>
          <span style={{fontSize:11,color:"var(--tx3)"}}>preferences</span>
        </div>
        {[{k:"adv",l:"Adventurous",lo:"Picky",hi:"Adventurous"},{k:"sp",l:"Spice",lo:"Mild",hi:"Spicy"},{k:"hc",l:"Health",lo:"Indulgent",hi:"Health-conscious"},{k:"sweet",l:"Sweet tooth",lo:"Savory",hi:"Sweet"}].map(function(sl){return <div key={sl.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:9,color:"var(--tx3)",width:50,textAlign:"right"}}>{sl.lo}</span>
          <input type="range" min="0" max="1" step="0.1" value={ge[sl.k]} onChange={function(e){var v=parseFloat(e.target.value);setGuests(function(gs){return gs.map(function(g){return g.id===ge.id?Object.assign({},g,function(){var o={};o[sl.k]=v;return o;}()):g;});});}} style={{flex:1}}/>
          <span style={{fontSize:9,color:"var(--tx3)",width:50}}>{sl.hi}</span>
        </div>;})}
        <button onClick={function(){setSel(function(s){var n=Object.assign({},s);delete n._guestEdit;return n;});}} style={{fontSize:10,fontWeight:600,color:"var(--ac)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"4px 0"}}>Done</button>
      </div>;})()}
      {guests.length>0&&!sel._guestEdit&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{guests.map(function(g){return <button key={g.id} onClick={function(){setSel(function(s){return Object.assign({},s,{_guestEdit:g.id});});}} style={{padding:"3px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",cursor:"pointer",fontFamily:"inherit",fontSize:9,color:"var(--tx3)"}}>{"\u2699 "+g.name}</button>;})}</div>}
      {/* Already had today */}
      <div style={{marginTop:"auto",paddingTop:12,paddingBottom:10,display:"flex",flexDirection:"column",gap:8}}>
      {alreadyHad?(function(){var ahr=rests.find(function(r){return r.id===alreadyHad;});return <button onClick={function(){setAlreadyHad(null);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(251,191,36,.25)",background:"rgba(251,191,36,.06)",cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}><span style={{fontSize:14}}>{ahr?ahr.emoji:"\uD83C\uDF7D"}</span><span style={{fontSize:11,fontWeight:600,color:"var(--yel)",flex:1}}>{"Already had "+(ahr?ahr.sn||ahr.name:"?")+" today"}</span><span style={{fontSize:10,color:"var(--tx3)"}}>{"\u2715 clear"}</span></button>;})():<button onClick={function(){setSel(function(s){return Object.assign({},s,{_showAlreadyHad:true});});}} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg1)",cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}><span style={{fontSize:11}}>{"🍽️"}</span><span style={{fontSize:11,fontWeight:500,color:"var(--tx3)"}}>{"Already ate somewhere today?"}</span></button>}
      {sel._showAlreadyHad&&!alreadyHad&&<div className="fade" style={{display:"flex",flexWrap:"wrap",gap:4,padding:"4px 0"}}>{rests.filter(function(r){return!r.bo&&r.to>0;}).sort(function(a,b){return(b.to90||b.to)-(a.to90||a.to);}).slice(0,12).map(function(r){return <button key={r.id} onClick={function(){setAlreadyHad(r.id);setSel(function(s){var n=Object.assign({},s);delete n._showAlreadyHad;return n;});}} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,color:"var(--tx2)",display:"flex",alignItems:"center",gap:4}}><span>{r.emoji}</span><span>{r.sn||r.name}</span></button>;})}<button onClick={function(){setSel(function(s){var n=Object.assign({},s);delete n._showAlreadyHad;return n;});}} style={{padding:"4px 8px",borderRadius:6,border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:10,color:"var(--tx3)"}}>{"cancel"}</button></div>}
      <button className="jfl-cta" onClick={function(){if(sel.sp.length>0){setSel(function(s){return Object.assign({},s,{qrLabel:null,qrEmoji:null});});var ob=getObvious(sel,rests,mctx,activeObvRules);if(ob){setSel(function(s){return Object.assign({},s,{ob:ob});});go("intercept");}else{go("step2");}}}} disabled={sel.sp.length===0} aria-disabled={sel.sp.length===0} style={{opacity:sel.sp.length===0?.3:1,transition:"opacity .3s",flexDirection:"row",gap:0,justifyContent:"center"}}><span style={{opacity:.55}}>{"Next:"}</span><span style={{padding:"0 6px"}}>{"Choose Mood"}</span><span style={{opacity:.55}}>{"→"}</span></button>
      </div>
    </div>
    <BottomNav go={go} active="decide" setSel={setSel}/>
  </div>}

  {/* ═══ QUICKPICK — who's eating → straight to results ═══ */}
  {vw==="quickpick"&&<div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
    <TopBar title={"Quick pick: "+mctx.label} sub="Who's eating?" back={function(){go("dashboard");}}  onTheme={cycleTheme} theme={gs2.theme||"auto"} onInfo={function(){setAboutOpen(true);}} onLogo={function(){setLogoConfirm(true);}}/>
    <div style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <div className="jfl-label" style={{marginBottom:8}}>Quick select</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {groups.filter(function(g){return g.id==="couple"||g.id==="family";}).map(function(g){var on=JSON.stringify(sel.sp.slice().sort())===JSON.stringify(g.people.slice().sort());return <button key={g.id} className={on?"jfl-chip on":"jfl-chip"} onClick={function(){setGrp(g.people);}}><span style={{fontSize:18}}>{g.emoji}</span><span>{g.name}</span></button>;})}
      </div>
      {sel._showAllGroups&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        {groups.filter(function(g){return g.id!=="couple"&&g.id!=="family";}).map(function(g){var on=JSON.stringify(sel.sp.slice().sort())===JSON.stringify(g.people.slice().sort());return <button key={g.id} className={on?"jfl-chip on":"jfl-chip"} onClick={function(){setGrp(g.people);}}><span style={{fontSize:18}}>{g.emoji}</span><span>{g.name}</span></button>;})}
      </div>}
      {!sel._showAllGroups&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{_showAllGroups:true});});}} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:500,color:"var(--tx3)",padding:0,textAlign:"left"}}>{groups.length-2+" more groups \u203A"}</button>}
      <div className="jfl-label" style={{marginTop:14,marginBottom:8}}>Or pick individually</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {(function(){var po=["kevin","jenna","madi","jack","emmy","jenna-mom","jenna-dad","kevin-mom","zoe","derek","wyatt","beckham","zara","leah","corey","tara","tyler","amanda"];var sorted=ppl.slice().sort(function(a,b){var ai=po.indexOf(a.id),bi=po.indexOf(b.id);if(ai<0)ai=999;if(bi<0)bi=999;return ai-bi;});var core=sorted.filter(function(p){return["kevin","jenna","madi","jack","emmy"].indexOf(p.id)>=0;});var rest=sorted.filter(function(p){return["kevin","jenna","madi","jack","emmy"].indexOf(p.id)<0;});var visible=sel._showAllPeople?sorted:core.concat(rest.filter(function(p){return sel.sp.indexOf(p.id)>=0;}));return visible;})().map(function(p){var on=sel.sp.indexOf(p.id)>=0;return <button key={p.id} className={on?"jfl-pill on":"jfl-pill"} onClick={function(){togP(p.id);}}>{p.emoji+" "+p.name}</button>;})}
        {!sel._showAllPeople&&<button onClick={function(){setSel(function(s){return Object.assign({},s,{_showAllPeople:true});});}} style={{padding:"6px 12px",borderRadius:20,border:"1px dashed var(--bdr)",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:500,color:"var(--tx3)"}}>{ppl.length-5+" more \u203A"}</button>}
      </div>
      <div style={{marginTop:"auto",paddingTop:20,paddingBottom:10}}><button className="jfl-cta" onClick={function(){if(sel.sp.length>0){setBusy(true);setTimeout(function(){var qs=_selWithCtx(sel);setRes(top3(scoreAll(_filterSkips(rests),qs,allPpl,hist,mctx,gs2)));setRrc(0);setResIdx(0);setBusy(false);go("results");},RESOLVE_DELAY);}}} disabled={sel.sp.length===0} aria-disabled={sel.sp.length===0} style={{opacity:sel.sp.length===0?.3:1,transition:"opacity .3s"}}>{"Get "+mctx.label+" Recommendation"}</button></div>
    </div>
    <BottomNav go={go} active="decide" setSel={setSel}/>
  </div>}

  {/* ═══ INTERCEPT ═══ */}
  {/* ═══ QR CONFIRM ═══ */}
  {vw==="qrConfirm"&&(function(){
    var moodObj=MOODS.find(function(m){return m.id===sel.mood;})||{label:"Balanced",emoji:"⚖️",c:"#4A9EFF",desc:"A little of everything"};
    var members=(sel.sp||[]).map(function(id){return ppl.find(function(p){return p.id===id;});}).filter(Boolean);
    return <div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px",overflow:"auto"}}>
        <div style={{textAlign:"center",width:"100%",maxWidth:340}}>
          <span style={{fontSize:64}}>{sel.qrEmoji||moodObj.emoji}</span>
          <div style={{fontSize:24,fontWeight:700,color:"var(--tx1)",marginTop:12}}>{sel.qrLabel||"Quick Resolve"}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:12}}>
            <span style={{fontSize:14}}>{moodObj.emoji}</span>
            <span style={{fontSize:14,fontWeight:600,color:moodObj.c}}>{moodObj.label}</span>
          </div>
          <div style={{fontSize:12,color:"var(--tx2)",marginTop:4}}>{moodObj.desc}</div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginTop:20}}>
            {members.map(function(p){return <span key={p.id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,background:"var(--bg2)",border:"1px solid var(--bdr)",fontSize:12,fontWeight:600,color:"var(--tx1)"}}><span style={{fontSize:16}}>{p.emoji}</span>{p.name}</span>;})}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:32,width:"100%"}}>
            <button className="jfl-cta" style={{padding:18}} onClick={function(){go("step2");}}>
              <span style={{fontSize:17,fontWeight:700}}>{"Let\u2019s go"}</span>
            </button>
            <button className="jfl-btn" style={{padding:14,fontSize:14}} onClick={function(){go("step1");}}>
              <span style={{fontWeight:600,color:"var(--tx2)"}}>Edit group first</span>
            </button>
            <button style={{background:"none",border:"none",color:"var(--tx3)",fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:"6px 0",marginTop:4}} onClick={function(){setSel(function(s){return Object.assign({},s,{qrLabel:null,qrEmoji:null});});go("dashboard");}}>Back to dashboard</button>
          </div>
        </div>
      </div>
      <BottomNav go={go} active="decide" setSel={setSel}/>
    </div>;
  })()||null}

  {/* ═══ INTERCEPT ═══ */}
  {vw==="intercept"&&sel.ob&&(function(){var ob=sel.ob,rule=ob.rule,rest=ob.rest;
    var accepted=sel.obAns;
    var spCount=(sel.sp||[]).length+(sel.xa||0)+(sel.xk||0);
    var isSolo1=spCount<=1;var isDuo1=spCount===2;
    function setAccepted(v){setSel(function(s){return Object.assign({},s,{obAns:v});});}
    return <div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px",overflow:"auto"}}>
        {accepted===undefined&&<div style={{textAlign:"center",width:"100%",maxWidth:340}}>
          <span style={{fontSize:80}}>{rest.emoji}</span>
          <div style={{fontSize:18,color:"var(--tx2)",marginTop:20,fontWeight:500}}>{rule.callout}</div>
          <div style={{fontSize:24,fontWeight:700,color:"var(--tx1)",marginTop:14,lineHeight:"1.3"}}>{rule.ask}</div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:36,width:"100%"}}>
            <button className="jfl-cta" style={{padding:18}} onClick={function(){setAccepted(true);}}>
              <span style={{fontSize:17,fontWeight:700}}>Yes, obviously</span>
            </button>
            <button className="jfl-btn" style={{padding:16,fontSize:16}} onClick={function(){setAccepted(false);}}>
              <span style={{fontWeight:600,color:"var(--tx1)"}}>{isSolo1?"No, I want something else":isDuo1?"No, we want something else":"No, we want something else"}</span>
            </button>
          </div>
        </div>}
        {accepted===true&&<div style={{textAlign:"center",width:"100%",maxWidth:340}} className="fade">
          <span style={{fontSize:80}}>{rest.emoji}</span>
          <div style={{fontSize:24,fontWeight:700,color:"var(--ac)",marginTop:20,lineHeight:"1.4"}}>{rule.yes}</div>
          {(function(){var isc=isSolo1?"solo":isDuo1?"couple":"family";var iac=getAc(rest,isc);return iac?<div style={{fontSize:13,color:"var(--tx2)",marginTop:12}}>{"~$"+iac+" est. total \u00B7 incl. fees + tip"}</div>:null;})()}
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:36,width:"100%"}}>
            {getDDLink(rest.id)&&<a href={getDDLink(rest.id)} target="_blank" rel="noopener noreferrer" className="jfl-cta" style={{padding:18,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700}}>Open in DoorDash</a>}
            <button className="jfl-btn" style={{padding:14,fontSize:14}} onClick={function(){setSel(function(s){return Object.assign({},s,{ob:null,obAns:undefined});});go("dashboard");}}>Back to dashboard</button>
          </div>
        </div>}
        {accepted===false&&<div style={{textAlign:"center",width:"100%",maxWidth:340}} className="fade">
          <span style={{fontSize:80}}>{"\uD83E\uDD28"}</span>
          <div style={{fontSize:22,fontWeight:700,color:"var(--tx1)",marginTop:20}}>{rule.no}</div>
          <div style={{marginTop:40,width:"100%"}}>
            <button className="jfl-cta" style={{padding:20,fontSize:17}} onClick={function(){setSel(function(s){return Object.assign({},s,{ob:null,obAns:undefined});});go("step2");}}>Continue to mood check</button>
            <button style={{background:"none",border:"none",color:"var(--tx3)",fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:"6px 0",marginTop:10}} onClick={function(){setSel(function(s){return Object.assign({},s,{ob:null,obAns:undefined});});go("dashboard");}}>Back to dashboard</button>
          </div>
        </div>}
      </div>
      <BottomNav go={go} active="decide" setSel={setSel}/>
    </div>;})()||null}

  {/* ═══ STEP 2 ═══ */}
  {vw==="step2"&&<MoodQuiz sel={sel} up={up} mctx={mctx} resolve={resolve} go={go} ppl={ppl} h2hFemale={gs2.h2hFemale!==false} onTheme={cycleTheme} theme={gs2.theme||"auto"} onInfo={function(){setAboutOpen(true);}} onLogo={function(){setLogoConfirm(true);}}/>}

  {/* ═══ RESULTS ═══ */}
  {vw==="results"&&results&&(function(){
    var exhausted=!results||resIdx>=results.length;
    var rSpCount=(sel.sp||[]).length+(sel.xa||0)+(sel.xk||0);
    var rSolo=rSpCount<=1;var rDuo=rSpCount===2;

    if(exhausted){
      var poolEmpty=!results||results.length===0;
      if(poolEmpty){
        return <div className="fade">
          <div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px"}}>
            <span style={{fontSize:64}}>{"\uD83D\uDEAB"}</span>
            <div style={{fontSize:22,fontWeight:700,color:"var(--tx1)",marginTop:16,textAlign:"center"}}>You vetoed everything</div>
            <div style={{fontSize:14,color:"var(--tx2)",marginTop:10,textAlign:"center"}}>{sessionSkips.length>0?"You skipped everything tonight! Clear your session skips or start fresh.":"Every restaurant in rotation is either closed or burned. There\u2019s nothing left to show."}</div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10,marginTop:28}}>
              {sessionSkips.length>0&&<button className="jfl-cta" style={{padding:14}} onClick={function(){setSessionSkips([]);reroll(false);}}>{"Clear tonight\u2019s skips and retry"}</button>}
              <button className={sessionSkips.length>0?"jfl-btn":"jfl-cta"} style={{padding:14}} onClick={function(){setR(function(rs){return rs.map(function(r){return r.bo?Object.assign({},r,{bo:false}):r;});});setSessionSkips([]);setResIdx(0);reroll(false);}}>Clear all vetoes and retry</button>
              <button className="jfl-btn" style={{padding:12,fontSize:12,color:"var(--tx2)"}} onClick={function(){go("dashboard");}}>Back to dashboard</button>
            </div>
          </div>
        </div>;
      }
      return <div className="fade">
        <div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px"}}>
          <span style={{fontSize:64}}>🫠</span>
          <div style={{fontSize:22,fontWeight:700,color:"var(--tx1)",marginTop:16,textAlign:"center"}}>{rSolo?"You're impossible tonight.":rDuo?"You two are impossible tonight.":"You all are impossible tonight."}</div>
          <div style={{fontSize:14,color:"var(--tx2)",marginTop:10,textAlign:"center",lineHeight:"1.5"}}>{rSolo?"You rejected every single option. Impressive, honestly.":"Every single option got rejected. Impressive, honestly."}</div>
          <div style={{width:"100%",marginTop:32}}>
            <button className="jfl-cta" style={{padding:14,width:"100%"}} onClick={function(){go("dashboard");}}>Start over</button>
          </div>
        </div>
      </div>;
    }

    var res=results[resIdx];var rest=res.r;var w=resIdx===0;
    var v=vcfg[res.vetoRisk],cf=ccfg[res.confidence],sn=Math.min(Math.max((res.score-20)/80,0),1);

    return <div className="slide-in" key={res.rid+"-"+resIdx} style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)",flexShrink:0}}>
        <div style={{zIndex:1,cursor:"pointer"}} onClick={function(){setLogoConfirm(true);}}><div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div><div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div></div>
        <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",padding:"0 90px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--tx1)",whiteSpace:"nowrap"}}>{mctx.label+" Resolved"}</span>
          <span style={{fontSize:10,fontWeight:400,color:"var(--tx3)"}}>{"Option "+(resIdx+1)+" of "+results.length}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>{(function(){var _d=gs2.theme==="dark"||((!gs2.theme||gs2.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);var _ib=_d?{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)"}:{background:"rgba(0,0,0,.06)",border:"1px solid rgba(0,0,0,.08)"};var _ibs=Object.assign({},_ib,{borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34});return <><button onClick={cycleTheme} style={Object.assign({},_ibs,{opacity:.8})}>{_d?"🌙":"☀️"}</button><button onClick={function(){setAboutOpen(true);}} style={_ibs}>{"ℹ️"}</button></>;})()}
        </div>
      </div>
      {/* ═══ OPTION 1: FULL DRAMATIC REVEAL ═══ */}
      {w&&<div style={{padding:"0 16px 16px",flex:1,overflow:"auto"}}>
        {/* Hero section */}
        <div style={{textAlign:"center",position:"relative",padding:"14px 0 10px"}}>
          <div style={{position:"absolute",left:"50%",top:"15%",transform:"translateX(-50%)",width:180,height:180,borderRadius:"50%",background:"linear-gradient(135deg,#F472B6,#C4956A)",opacity:.1,filter:"blur(60px)",pointerEvents:"none"}}></div>
          <div className="pop" style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"var(--ac)",marginBottom:8,animationDelay:".05s"}}>{"✨ "+(rSolo?"YOUR":"YOUR TEAM\u2019S")+" "+mctx.label.toUpperCase()+" PICK ✨"}</div>
          <div className="tada" style={{fontSize:56,display:"inline-block",position:"relative",zIndex:1}}>{rest.emoji}</div>
          <div className="pop" style={{fontSize:26,fontWeight:800,color:"var(--tx1)",marginTop:6,animationDelay:".15s"}}>{rest.name}</div>
          <div className="pop" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,animationDelay:".25s"}}>
            {rest.fav&&<span style={{fontSize:11,color:"var(--ac)",fontWeight:600}}>{"❤️ Favorite"}</span>}
            {rest.fav&&<span style={{width:1,height:10,background:"var(--bdr)",display:"inline-block"}}></span>}
            <span style={{fontSize:12,color:"var(--tx2)"}}>{"~"+res.eta+" min delivery"}</span>
          </div>
        <div className="pop" style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",marginTop:8,animationDelay:".4s"}}>{(res.tags||[]).slice(0,4).map(function(t){var c=TC[t]||["var(--bg2)","var(--tx2)"];return <span key={t} style={{fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:20,background:c[0],color:c[1]}}>{t}</span>;})}</div>
        </div>

        {/* Power meter */}
        <div className="pop" style={{animationDelay:".3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <span style={{fontSize:11,fontWeight:700,color:cf.c}}>{cf.l}</span>
            <span style={{fontSize:11,fontWeight:700,color:v.c}}>{v.l}</span>
          </div>
          <div style={{height:6,background:"var(--bdr)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:(sn*100)+"%",background:"linear-gradient(90deg,#F472B6,#C4956A)",borderRadius:3,transition:"width .8s ease-out"}}></div></div>
        </div>

        {/* Flavor text */}
        <div className="pop" style={{fontSize:14,color:"var(--tx1)",fontStyle:"italic",marginTop:8,textAlign:"center",fontWeight:500,animationDelay:".35s"}}>{res.vetoFlavor}</div>

        {/* Tags */}

        {/* Suggested order - now before DoorDash */}
        {res.order&&<div className="jfl-card pop" style={{marginTop:10,padding:"10px 12px",animationDelay:".45s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:.5}}>Suggested Order</div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",marginTop:3}}>{res.order.title}</div>
              <div style={{fontSize:10,color:"var(--tx2)",marginTop:2,lineHeight:"1.4"}}>{(res.order.items||[]).join(" \u00B7 ")}</div>
            </div>
            <div style={{textAlign:"right",paddingLeft:12,flexShrink:0}}>
              {(function(){var sc2=res.order.sc||"couple";var ac2=getAc(rest,sc2);if(ac2)return <div><div style={{fontSize:16,fontWeight:700,color:"var(--tx1)"}}>{"~$"+ac2}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:1}}>est. total</div><div style={{fontSize:9,color:"var(--tx3)"}}>incl. fees + tip</div></div>;if(res.order.price)return <div><div style={{fontSize:16,fontWeight:700,color:"var(--tx1)"}}>{"~$"+res.order.price}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:1}}>food subtotal</div></div>;return null;})()}
            </div>
          </div>
          {(function(){var alts=(rest.orders||[]).filter(function(o){return o.id!==(res.order&&res.order.id);}).slice(0,3);if(alts.length<1)return null;
            return <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8,borderTop:"1px solid var(--bdr)",paddingTop:6}}>
              <span style={{fontSize:9,color:"var(--tx3)",fontWeight:600,alignSelf:"center"}}>Also:</span>
              {alts.map(function(a){return <button key={a.id} onClick={function(){var nr=results.map(function(r,ri){if(ri===resIdx)return Object.assign({},r,{order:a});return r;});setRes(nr);}} style={{padding:"2px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx2)",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a.title}</button>;})}
            </div>;})()}
        </div>}

        {/* DoorDash CTA */}
        <div className="pop" style={{marginTop:10,animationDelay:".5s"}}>
          {res.ddLink&&<a href={res.ddLink} target="_blank" rel="noopener noreferrer" className="jfl-cta" style={{padding:14,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700}}>Open in DoorDash</a>}
        </div>
        {/* Share */}
        <div className="pop" style={{marginTop:6,animationDelay:".55s"}}>
          <button style={{width:"100%",padding:10,fontSize:12,fontWeight:600,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={function(){var txt=rest.emoji+" Jennarate picked: "+rest.name+"\n"+res.vetoFlavor+(res.order?"\nOrder: "+res.order.title:"")+"\n\nhttps://"+window.location.hostname;if(navigator.share){navigator.share({title:"Jennarate: "+rest.name,text:txt}).catch(function(){});}else{navigator.clipboard.writeText(txt).then(function(){});}}}><span>{"📤"}</span><span>{navigator.share?"Share this pick":"Copy to clipboard"}</span></button>
        </div>

        {/* Why this expanded - tappable to collapse */}
        {whyOpen&&<div onClick={function(){setWhyOpen(false);}} style={{background:"var(--bg2)",border:"1px solid var(--bdr)",borderRadius:10,padding:"8px 12px",marginTop:8,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:10,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:.5}}>Why this?</span>
            <span style={{fontSize:9,color:"var(--tx3)"}}>{"\u25B2 close"}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {res.reasons.map(function(r,i){return <span key={"r"+i} style={{fontSize:10,color:"var(--grn)"}}>{(i>0?" \u00B7 ":"")+""+r}</span>;})}
            {res.concerns&&res.concerns.map(function(c,i){return <span key={"c"+i} style={{fontSize:10,color:"var(--red)"}}>{" \u00B7 "+c}</span>;})}
          </div>
          {(function(){var sp=sel.sp||[];if(sp.length<2)return null;var risks=[];var hasKids2=sp.some(function(id){return kidIds.indexOf(id)>=0;});if(hasKids2){risks.push({l:"Kids",v:rest.ks>=.7?"safe":rest.ks>=.4?"okay":"risky",c:rest.ks>=.7?"var(--grn)":rest.ks>=.4?"var(--yel)":"var(--red)"});}sp.forEach(function(id){if(kidIds.indexOf(id)>=0)return;var p=ppl.find(function(pp){return pp.id===id;});if(!p)return;var fit=0,n=0;fit+=p.hc*rest.hs+(1-p.hc)*rest.cs;n++;fit+=p.sweet*rest.ts+(1-p.sweet)*(1-rest.ts)*.5;n++;fit+=p.adv*(1-rest.rs)*.5+rest.rs*.5;n++;fit=fit/n;var lbl=fit>.45?"good":fit>.3?"okay":"stretch";risks.push({l:p.name,v:lbl,c:fit>.45?"var(--grn)":fit>.3?"var(--yel)":"var(--red)"});});
            if(risks.length<1)return null;
            return <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{fontSize:10,color:"var(--tx3)"}}>fit:</span>{risks.map(function(r,i){return <span key={i} style={{display:"flex",alignItems:"center",gap:4}}>{i>0&&<span style={{width:1,height:10,background:"var(--bdr)",display:"inline-block",marginRight:2}}></span>}<span style={{fontSize:10,fontWeight:700,color:"var(--tx1)"}}>{r.l}</span><span style={{fontSize:10,fontWeight:600,color:r.c}}>{r.v}</span></span>;})}</div>;
          })()}
        </div>}

        {/* Bottom buttons */}
        {!whyOpen&&<div style={{display:"flex",gap:6,marginTop:8}}>
          <button style={{flex:1,padding:10,fontSize:11,fontWeight:600,background:"rgba(244,114,182,.06)",border:"1px solid rgba(244,114,182,.15)",borderRadius:10,color:"var(--ac)",cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setWhyOpen(true);}}>{"Why this?"}</button>
          <button style={{flex:2,padding:10,fontSize:11,fontWeight:600,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit"}} onClick={function(){if(resIdx+1<results.length){setResIdx(resIdx+1);setWhyOpen(false);}else{go("dashboard");}}}>{"Not feeling this one"}</button>
          <button style={{flex:1,padding:10,fontSize:11,fontWeight:500,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.6}} onClick={function(){go("dashboard");}}>{"Start over"}</button>
        </div>}
        {whyOpen&&<div style={{display:"flex",gap:6,marginTop:8}}>
          <button style={{flex:2,padding:10,fontSize:11,fontWeight:600,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit"}} onClick={function(){if(resIdx+1<results.length){setResIdx(resIdx+1);setWhyOpen(false);}else{go("dashboard");}}}>{"Not feeling this one"}</button>
          <button style={{flex:1,padding:10,fontSize:11,fontWeight:500,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.6}} onClick={function(){go("dashboard");}}>{"Start over"}</button>
        </div>}
        <button style={{width:"100%",padding:8,fontSize:10,fontWeight:500,marginTop:6,background:"none",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.5}} onClick={function(){setSessionSkips(function(sk){return sk.concat([res.rid]);});reroll(false);}}>{"Not tonight \u2014 skip for this session"}</button>
      </div>}

      {/* ═══ OPTIONS 2-3: SAME DRAMATIC LAYOUT WITH MEDALS ═══ */}
      {!w&&<div style={{padding:"0 16px 20px",flex:1,overflow:"auto"}}>
        {/* Medal header */}
        <div style={{textAlign:"center",position:"relative",padding:"20px 0 16px"}}>
          <div style={{position:"absolute",left:"50%",top:"20%",transform:"translateX(-50%)",width:180,height:180,borderRadius:"50%",background:resIdx===1?"#C0C0C0":"#B8976A",opacity:.06,filter:"blur(60px)",pointerEvents:"none"}}></div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:resIdx===1?"#C0C0C0":"#B8976A",marginBottom:10}}>{resIdx===1?"\uD83E\uDD48 SECOND CHOICE":"\uD83E\uDD49 THIRD CHOICE"}</div>
          <span style={{fontSize:64,display:"inline-block"}}>{rest.emoji}</span>
          <div style={{fontSize:26,fontWeight:800,color:"var(--tx1)",marginTop:8}}>{rest.name}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:6}}>
            {rest.fav&&<span style={{fontSize:12,color:"var(--ac)",fontWeight:600}}>{"❤️ Favorite"}</span>}
            {rest.fav&&<span style={{width:1,height:10,background:"var(--bdr)",display:"inline-block"}}></span>}
            <span style={{fontSize:12,color:"var(--tx2)"}}>{"~"+res.eta+" min delivery"}</span>
          </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:10}}>{(res.tags||[]).slice(0,4).map(function(t){var c=TC[t]||["var(--bg2)","var(--tx2)"];return <span key={t} style={{fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:20,background:c[0],color:c[1]}}>{t}</span>;})}</div>
        </div>

        {/* Power meter */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:12,fontWeight:700,color:cf.c}}>{cf.l}</span>
          <span style={{fontSize:12,fontWeight:700,color:v.c}}>{v.l}</span>
        </div>
        <div style={{height:8,background:"var(--bdr)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:(sn*100)+"%",background:resIdx===1?"linear-gradient(90deg,#C0C0C0,#A0A0A0)":"linear-gradient(90deg,#B8976A,#A0652A)",borderRadius:4,transition:"width .8s ease-out"}}></div></div>

        <div style={{fontSize:15,color:"var(--tx1)",fontStyle:"italic",marginTop:10,textAlign:"center",fontWeight:500}}>{res.vetoFlavor}</div>

        {/* Tags */}

        {/* Suggested order - same layout as option 1 */}
        {res.order&&<div className="jfl-card" style={{marginTop:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:.5}}>Suggested Order</div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",marginTop:3}}>{res.order.title}</div>
              <div style={{fontSize:10,color:"var(--tx2)",marginTop:2,lineHeight:"1.4"}}>{(res.order.items||[]).join(" \u00B7 ")}</div>
            </div>
            <div style={{textAlign:"right",paddingLeft:12,flexShrink:0}}>
              {(function(){var sc3=res.order.sc||"couple";var ac3=getAc(rest,sc3);if(ac3)return <div><div style={{fontSize:16,fontWeight:700,color:"var(--tx1)"}}>{"~$"+ac3}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:1}}>est. total</div><div style={{fontSize:9,color:"var(--tx3)"}}>incl. fees + tip</div></div>;if(res.order.price)return <div><div style={{fontSize:16,fontWeight:700,color:"var(--tx1)"}}>{"~$"+res.order.price}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:1}}>food subtotal</div></div>;return null;})()}
            </div>
          </div>
          {(function(){var alts2=(rest.orders||[]).filter(function(o){return o.id!==(res.order&&res.order.id);}).slice(0,3);if(alts2.length<1)return null;
            return <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8,borderTop:"1px solid var(--bdr)",paddingTop:6}}>
              <span style={{fontSize:9,color:"var(--tx3)",fontWeight:600,alignSelf:"center"}}>Also:</span>
              {alts2.map(function(a){return <button key={a.id} onClick={function(){var nr=results.map(function(r,ri){if(ri===resIdx)return Object.assign({},r,{order:a});return r;});setRes(nr);}} style={{padding:"2px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx2)",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a.title}</button>;})}
            </div>;})()}
        </div>}

        {/* DoorDash CTA */}
        <div style={{marginTop:10}}>
          {res.ddLink&&<a href={res.ddLink} target="_blank" rel="noopener noreferrer" className="jfl-cta" style={{padding:14,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700}}>Open in DoorDash</a>}
        </div>
        {/* Share */}
        <div style={{marginTop:6}}>
          <button style={{width:"100%",padding:10,fontSize:12,fontWeight:600,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={function(){var txt=rest.emoji+" Jennarate picked: "+rest.name+"\n"+res.vetoFlavor+(res.order?"\nOrder: "+res.order.title:"")+"\n\nhttps://"+window.location.hostname;if(navigator.share){navigator.share({title:"Jennarate: "+rest.name,text:txt}).catch(function(){});}else{navigator.clipboard.writeText(txt).then(function(){});}}}><span>{"📤"}</span><span>{navigator.share?"Share this pick":"Copy to clipboard"}</span></button>
        </div>

        {/* Three action buttons - proportional */}
        <div style={{display:"flex",gap:6,marginTop:10}}>
          <button style={{flex:3,padding:"10px 4px",fontSize:10,fontWeight:500,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit",lineHeight:"1.3"}} onClick={function(){if(resIdx>0)setResIdx(resIdx-1);}}>{resIdx===1?"Let me see option 1 again":"Option 2 wasn\u2019t so bad"}</button>
          <button style={{flex:3,padding:"10px 4px",fontSize:10,fontWeight:600,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx2)",cursor:"pointer",fontFamily:"inherit",lineHeight:"1.3"}} onClick={function(){if(resIdx+1<results.length){setResIdx(resIdx+1);setWhyOpen(false);}else{go("dashboard");}}}>{resIdx===1?"No, not feeling this either":"Nope, this won\u2019t do either"}</button>
          <button style={{flex:2,padding:"10px 4px",fontSize:10,fontWeight:500,background:"none",border:"1px solid var(--bdr)",borderRadius:10,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.5,lineHeight:"1.3"}} onClick={function(){go("dashboard");}}>{"Start over"}</button>
        </div>
        <button style={{width:"100%",padding:8,fontSize:10,fontWeight:500,marginTop:6,background:"none",border:"1px solid var(--bdr)",borderRadius:8,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.5}} onClick={function(){setSessionSkips(function(sk){return sk.concat([res.rid]);});reroll(false);}}>{"Not tonight \u2014 skip for this session"}</button>
      </div>}
    </div>;})()||null}

  {/* ═══ HISTORY ═══ */}
  {vw==="history"&&<div className="fade" style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
    {sel.hf==="rest"?<TopBar title="Restaurant Detail" back={function(){setSel(function(s){return Object.assign({},s,{hf:s.hfPrev||"all"});});}}  onTheme={cycleTheme} theme={gs2.theme||"auto"} onInfo={function(){setAboutOpen(true);}} onLogo={function(){setLogoConfirm(true);}}/>
    :<div style={{position:"relative",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{zIndex:1,cursor:"pointer"}} onClick={function(){setLogoConfirm(true);}}><div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div><div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div></div><div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",padding:"0 90px",fontSize:14,fontWeight:700,color:"var(--tx1)"}}>Order History</div><div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>{(function(){var _d=gs2.theme==="dark"||((!gs2.theme||gs2.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);var _ib=_d?{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)"}:{background:"rgba(0,0,0,.06)",border:"1px solid rgba(0,0,0,.08)"};var _ibs=Object.assign({},_ib,{borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34});return <><button onClick={cycleTheme} style={Object.assign({},_ibs,{opacity:.8})}>{_d?"🌙":"☀️"}</button><button onClick={function(){setAboutOpen(true);}} style={_ibs}>{"ℹ️"}</button></>;})()}</div></div>}
    <div style={{flex:1,padding:"10px 16px",overflow:"auto"}}>
      {sel.hf==="rest"&&(function(){var r=rests.find(function(x){return x.id===sel.hrid;});if(!r)return null;var orderScenarios=r.orders||[];return <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:10}}>
          <span style={{fontSize:44}}>{r.emoji}</span>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:22,fontWeight:700,color:"var(--tx1)"}}>{r.name}</span>{r.fav&&<span style={{fontSize:8,fontWeight:700,color:"var(--ac)",background:"rgba(244,114,182,.15)",padding:"2px 6px",borderRadius:4}}>FAV</span>}</div>
            {r.bo&&<div style={{fontSize:11,fontWeight:600,color:"var(--red)",marginTop:2}}>{r.bo==="closed"?"Closed":r.bo==="quality"?"Bad food":r.bo==="accuracy"?"Order errors":r.bo==="yucky"?"Yucky":"Inactive"}</div>}
          </div>
        </div>
        <div className="jfl-card" style={{display:"flex",alignItems:"center",padding:"10px 0",marginBottom:8}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:700,color:"var(--tx1)",fontVariantNumeric:"tabular-nums"}}>{r.to}</div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)"}}>{r.to===1?"order all time":"orders all time"}</div>
          </div>
          <div style={{width:1,height:28,background:"var(--bdr)"}}></div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"var(--tx1)",fontVariantNumeric:"tabular-nums",fontFamily:"'IBM Plex Sans',system-ui,sans-serif"}}>{fmtDate(r.ld)}</div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)"}}>last order</div>
          </div>
        </div>
        {(r.acS||r.acC||r.acF||r.acG)&&<div className="jfl-card" style={{padding:"8px 0",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",textAlign:"center",marginBottom:6,letterSpacing:.5}}>AVG ORDER TOTAL</div>
          <div style={{display:"flex",alignItems:"center"}}>
          {r.acS&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{"~$"+r.acS}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Solo</div></div>}
          {r.acS&&r.acC&&<div style={{width:1,height:24,background:"var(--bdr)"}}></div>}
          {r.acC&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{"~$"+r.acC}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Couple</div></div>}
          {r.acC&&r.acF&&<div style={{width:1,height:24,background:"var(--bdr)"}}></div>}
          {r.acF&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{"~$"+r.acF}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Family</div></div>}
          {r.acF&&r.acG&&<div style={{width:1,height:24,background:"var(--bdr)"}}></div>}
          {r.acG&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{"~$"+r.acG}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Group</div></div>}
          </div>
          <div style={{fontSize:9,color:"var(--tx3)",textAlign:"center",marginTop:4,fontStyle:"italic"}}>incl. est. fees + tip</div>
        </div>}
        {r.notes&&<div className="jfl-card" style={{marginBottom:8,padding:"8px 12px"}}><div style={{fontSize:13,color:"var(--tx2)",lineHeight:"1.5"}}>{r.notes}</div></div>}
        {(r.tags||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8,justifyContent:"center"}}>{(r.tags||[]).map(function(t){var c=TC[t]||["var(--bg2)","var(--tx2)"];return <span key={t} style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,background:c[0],color:c[1]}}>{t}</span>;})}</div>}
        <div className="jfl-card" style={{padding:"10px 12px"}}>
          <div className="jfl-label">Usual orders</div>
          {orderScenarios.slice(0,sel.showAllOrders?999:2).map(function(o,oi){return <div key={o.id} style={{marginTop:6,paddingTop:6,borderTop:oi>0?"1px solid var(--bdr)":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:"var(--tx1)"}}>{o.title}</span><span style={{fontSize:12,fontWeight:600,color:"var(--tx2)"}}>{"~$"+o.price+" food"}</span></div>
            <div style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>{(o.items||[]).join(" · ")}</div>
            {o.note&&<div style={{fontSize:12,color:"var(--tx2)",fontStyle:"italic",marginTop:2}}>{o.note}</div>}
          </div>;})}
          {orderScenarios.length>2&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--bdr)",textAlign:"center"}}><button onClick={function(){setSel(function(s){return Object.assign({},s,{showAllOrders:!s.showAllOrders});});}} style={{background:"rgba(244,114,182,.08)",border:"1px solid rgba(244,114,182,.2)",color:"var(--ac)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",padding:"6px 16px",borderRadius:8}}>{sel.showAllOrders?"Show less":("+"+(orderScenarios.length-2)+" more usual order"+(orderScenarios.length-2===1?"":"s"))}</button></div>}
        </div>
        {getDDLink(r.id)&&<a href={getDDLink(r.id)} target="_blank" rel="noopener noreferrer" className="jfl-cta" style={{marginTop:8,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,padding:12}}>Open in DoorDash</a>}
      </div>;})()||null}
      {sel.hf!=="rest"&&(function(){var list=rests.slice();if(sel.hf==="favs")list=list.filter(function(r){return r.fav;});else if(sel.hf==="active")list=list.filter(function(r){return!r.bo;});if(sel.hsort==="orders")list.sort(function(a,b){return b.to-a.to;});else if(sel.hsort==="recent")list.sort(function(a,b){var da=a.ld?new Date(a.ld).getTime():0;var db=b.ld?new Date(b.ld).getTime():0;return db-da;});else if(sel.hsort==="cuisine")list.sort(function(a,b){return(a.cat||"zzz").localeCompare(b.cat||"zzz")||a.name.localeCompare(b.name);});else list.sort(function(a,b){return a.name.localeCompare(b.name);});var totalOrders=list.reduce(function(s,r){return s+r.to;},0);
        return <div>
        {/* Filter bar */}
        <div style={{display:"flex",gap:6,marginBottom:10,paddingBottom:10,borderBottom:"1px solid var(--bdr)"}}>
          {[{id:"all",l:"All"},{id:"favs",l:"Favorites"},{id:"active",l:"Active"}].map(function(f){return <button key={f.id} onClick={function(){setSel(function(s){return Object.assign({},s,{hf:f.id});});}} style={{padding:"5px 14px",borderRadius:8,border:"1px solid "+(sel.hf===f.id?"var(--ac)":"var(--bdr)"),background:sel.hf===f.id?"rgba(244,114,182,.15)":"var(--bg1)",color:sel.hf===f.id?"var(--ac)":"var(--tx2)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{f.l}</button>;})}
          <button className={sel.hf==="insights"?"":"insightsShimmer"} onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"insights"});});}} style={{padding:"6px 16px",borderRadius:20,border:sel.hf==="insights"?"none":"1px solid rgba(196,149,106,.5)",background:sel.hf==="insights"?(isDk?"linear-gradient(135deg,#C4956A,#D4A574)":"linear-gradient(135deg,#A07828,#8A6520)"):"linear-gradient(90deg,rgba(196,149,106,.15),rgba(212,165,116,.3),rgba(196,149,106,.15))",backgroundSize:sel.hf==="insights"?"100% 100%":"200% 100%",color:sel.hf==="insights"?"#fff":"var(--grn)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:.3,boxShadow:sel.hf==="insights"?(isDk?"0 2px 8px rgba(196,149,106,.4)":"0 2px 8px rgba(160,120,40,.3)"):"none",textShadow:sel.hf==="insights"?"0 1px 2px rgba(0,0,0,.2)":"none"}}>{"\u2728 Insights"}</button>
        </div>

        {/* ═══ INSIGHTS VIEW ═══ */}
        {sel.hf==="insights"&&(function(){try{
          var totalAll=rests.length;var activeCount=rests.filter(function(r){return!r.bo;}).length;
          var favCount=rests.filter(function(r){return r.fav;}).length;
          var pctFav=totalAll>0?Math.round(favCount/totalAll*100):0;
          var totalOrders2=rests.reduce(function(s,r){return s+r.to;},0);
          var hot=rests.filter(function(r){return(r.to90||0)>=3&&!r.bo;}).sort(function(a,b){return(b.to90||0)-(a.to90||0);}).slice(0,6);
          var quiet=rests.filter(function(r){return r.to>5&&(r.to90||0)===0&&!r.bo;}).sort(function(a,b){return(b.to||0)-(a.to||0);}).slice(0,6);

          var now90=Date.now()-90*86400000;
          var newFinds=rests.filter(function(r){if(r.bo||!r.fd)return false;var fd=new Date(r.fd+"T12:00:00").getTime();return fd>=now90;}).sort(function(a,b){return new Date(b.fd+"T12:00:00").getTime()-new Date(a.fd+"T12:00:00").getTime();}).slice(0,4);
          var rediscovered=rests.filter(function(r){if(r.bo||(r.to90||0)<1)return false;var prev=r.to-(r.to90||0);if(prev<1)return false;var recentOnly=(r.to365||0)<=(r.to90||0);var hadOlder=r.to>(r.to365||0);return recentOnly&&hadOlder;}).sort(function(a,b){return(b.to90||0)-(a.to90||0);}).slice(0,4);
          /* Insight computations */
          var favOrders=rests.filter(function(r){return r.fav;}).reduce(function(s,r){return s+r.to;},0);
          var favPctOrders=totalOrders2>0?Math.round(favOrders/totalOrders2*100):0;
          var top5=rests.slice().sort(function(a,b){return b.to-a.to;}).slice(0,5);
          var top5orders=top5.reduce(function(s,r){return s+r.to;},0);
          var top5pct=totalOrders2>0?Math.round(top5orders/totalOrders2*100):0;
          var repeatCount=rests.filter(function(r){return r.to>=2;}).length;
          var repeatPct=totalAll>0?Math.round(repeatCount/totalAll*100):0;
          var recent90=rests.filter(function(r){return(r.to90||0)>0;}).length;

          var streaking=rests.filter(function(r){return(r.streak||0)>=2&&!r.bo;}).sort(function(a,b){return(b.streak||0)-(a.streak||0);});
          var sections=[
            {key:"hot",e:"\uD83D\uDD25",t:"Hot right now",d:"3+ orders in last 90 days",items:hot,c:"var(--grn)",fmt:function(r){return(r.to90||0)+" in last 90 days";}},
            {key:"streak",e:"\uD83D\uDCAB",t:"On a streak",d:"2+ consecutive orders",items:streaking,c:"var(--ac)",fmt:function(r){return(r.streak||0)+" in a row";}},
            {key:"new",e:"\uD83C\uDF1F",t:"New Finds",d:"First order in last 90 days",items:newFinds,c:"var(--yel)",fmt:function(r){return r.to+(r.to===1?" order":" orders");}},
            {key:"redis",e:"\uD83D\uDC9C",t:"Rediscovered",d:"Back after 1yr+ away",items:rediscovered,c:"#C084FC",fmt:function(r){return(r.to90||0)+" in last 90 days";}},
            {key:"quiet",e:"\uD83D\uDCA4",t:"Gone quiet",d:"5+ lifetime orders, none in last 90 days",items:quiet,c:"var(--tx2)",fmt:function(r){return r.to+" orders \u00B7 last "+fmtDate(r.ld);}}
          ];
          var filled=sections.filter(function(s){return s.items.length>0;});
          var empty=sections.filter(function(s){return s.items.length===0;});
          return <div className="fade">
            {/* Insight cards - 2x2 diagonal colors */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div className="jfl-card" style={{padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:"var(--ac)"}}>{favPctOrders+"%"}</div>
                <div style={{fontSize:12,color:"var(--tx2)",marginTop:4,lineHeight:"1.4"}}>{"of orders come from"}<br/>{"your favorites"}</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,opacity:.5}}>{pctFav+"% of restaurants are favorited"}</div>
              </div>
              <div className="jfl-card" style={{padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:"var(--grn)"}}>{recent90}</div>
                <div style={{fontSize:12,color:"var(--tx2)",marginTop:4,lineHeight:"1.4"}}>{"restaurants ordered from recently"}</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,opacity:.5}}>{"based on last 90 days of data"}</div>
              </div>
              <div className="jfl-card" style={{padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:"var(--grn)"}}>{top5pct+"%"}</div>
                <div style={{fontSize:12,color:"var(--tx2)",marginTop:4,lineHeight:"1.4"}}>{"of orders are from your top 5 places"}</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,opacity:.5}}>{top5.map(function(r){return r.emoji;}).join(" ")}</div>
              </div>
              <div className="jfl-card" style={{padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:"var(--ac)"}}>{repeatPct+"%"}</div>
                <div style={{fontSize:12,color:"var(--tx2)",marginTop:4,lineHeight:"1.4"}}>{"of restaurants get a repeat order"}</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,opacity:.5}}>{repeatCount+" of "+totalAll+" reordered"}</div>
              </div>
            </div>

            <div style={{borderTop:"1px solid var(--bdr)",marginBottom:12}}></div>

            {/* Category cards - smart sorted, compact */}
            {(function(){
              var orderedKeys=["hot","streak","new","redis","quiet"];
              var withData=orderedKeys.filter(function(k){var s=sections.find(function(x){return x.key===k;});return s&&s.items.length>0;});
              var withoutData=orderedKeys.filter(function(k){var s=sections.find(function(x){return x.key===k;});return s&&s.items.length===0;});
              var sorted=withData.concat(withoutData);
              return sorted.map(function(key){
                var sec=sections.find(function(s){return s.key===key;});
                if(!sec)return null;
                var hasDat=sec.items.length>0;
                var isOpen=sel.insightOpen===sec.key;
                var isFlashing=sel.insightFlash===sec.key;
                return <div key={sec.key} style={{marginBottom:4,borderRadius:8,border:isOpen?"1px solid "+sec.c:"1px solid var(--bdr)",background:"var(--bg2)",overflow:"hidden",opacity:hasDat?1:.4,transition:"all .2s"}}>
                  <button onClick={function(){if(hasDat){setSel(function(s){return Object.assign({},s,{insightOpen:isOpen?null:sec.key,insightFlash:null});});}else{setSel(function(s){return Object.assign({},s,{insightFlash:sec.key});});setTimeout(function(){setSel(function(s){var n=Object.assign({},s);delete n.insightFlash;return n;});},1200);}}} style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"8px 10px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:14}}>{sec.e}</span>
                    <span style={{fontSize:13,fontWeight:600,color:hasDat?"var(--tx1)":"var(--tx3)",flex:1,textAlign:"left"}}>{sec.t}{isOpen&&<span style={{fontSize:11,fontWeight:400,color:"var(--tx2)",marginLeft:6,opacity:.6}}>{sec.d}</span>}</span>
                    {hasDat&&<span style={{fontSize:11,fontWeight:700,color:sec.c,background:"rgba(255,255,255,.06)",padding:"1px 8px",borderRadius:10}}>{sec.items.length}</span>}
                    {!hasDat&&<span style={{fontSize:11,color:isFlashing?"var(--ac)":"var(--tx3)",fontWeight:isFlashing?700:500,transition:"all .3s"}}>{isFlashing?"None right now":"None"}</span>}
                    {hasDat&&<span style={{fontSize:9,color:"var(--tx3)",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>{"\u25BC"}</span>}
                  </button>
                  {isOpen&&hasDat&&<div style={{padding:"0 10px 8px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                      {sec.items.map(function(r){return <button key={r.id} onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:"insights",hrid:r.id});});}} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg1)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                        <span style={{fontSize:18}}>{r.emoji}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sn||r.name}</div>
                          <div style={{fontSize:10,fontWeight:600,color:sec.c}}>{sec.fmt(r)}</div>
                        </div>
                      </button>;})}
                    </div>
                  </div>}
                </div>;
              });
            })()}
          </div>;
        }catch(e){return <div className="jfl-card" style={{padding:16,textAlign:"center"}}><span style={{fontSize:11,color:"var(--tx3)"}}>Not enough order history to show insights yet</span></div>;}})()}

        {/* ═══ RESTAURANT LIST (non-insights) ═══ */}
        {sel.hf!=="insights"&&<div>

        {/* Sort dropdown */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:11,color:"var(--tx3)",fontWeight:500}}>Sort by</span>
          <select value={sel.hsort} onChange={function(e){setSel(function(prev){return Object.assign({},prev,{hsort:e.target.value});});setHExp({});}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:11,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>
            <option value="name">{"\uD83D\uDD24 A\u2013Z"}</option>
            <option value="orders">{"\uD83D\uDCE6 Most orders"}</option>
            <option value="recent">{"\uD83D\uDD50 Most recent"}</option>
            <option value="cuisine">{"\uD83C\uDF7D Cuisine"}</option>
          </select>
        </div>

        {/* Count line */}
        <div style={{fontSize:11,color:"var(--tx3)",marginBottom:8,fontWeight:500}}>{list.length+" restaurants · "+totalOrders+(totalOrders===1?" total order":" total orders")}</div>
        {(function(){
          var SUB_LABELS={"fast-food":"Fast Food","fast-casual":"Fast Casual","casual-dining":"Casual Dining","coffee-snack":"Coffee & Snacks",burgers:"Burgers",pizza:"Pizza",subs:"Subs",asian:"Asian",mexican:"Mexican",italian:"Italian",indian:"Indian",healthy:"Healthy",bbq:"BBQ",wings:"Wings",breakfast:"Breakfast",dessert:"Dessert",other:"Other"};
          var groups=[];
          if(sel.hsort==="cuisine"){
            var UMBRELLAS=[
              {key:"fastfood",label:"Fast Food",emoji:"\uD83C\uDF54",cats:["fast-food","burgers"]},
              {key:"subsdeli",label:"Subs & Fast Casual",emoji:"\uD83E\uDD6A",cats:["subs","fast-casual"]},
              {key:"healthy",label:"Healthy",emoji:"\uD83E\uDD57",cats:["healthy"]},
              {key:"asian-indian",label:"Asian & Indian",emoji:"\uD83C\uDF5C",cats:["asian","indian"]},
              {key:"pizza-italian",label:"Pizza & Italian",emoji:"\uD83C\uDF55",cats:["pizza","italian"]},
              {key:"breakfast",label:"Breakfast",emoji:"\uD83E\uDD5E",cats:["breakfast"]},
              {key:"sweets",label:"Dessert & Coffee",emoji:"\uD83C\uDF70",cats:["dessert","coffee-snack"]},
              {key:"dining",label:"Dining & More",emoji:"\uD83C\uDF7D\uFE0F",cats:["casual-dining","mexican","bbq","wings","other"]}
            ];
            UMBRELLAS.forEach(function(u){
              var items=list.filter(function(r){return u.cats.indexOf(r.cat||"other")>=0;});
              if(items.length>0){
                var hasSub=u.cats.length>1&&items.some(function(r){return items.some(function(r2){return r.cat!==r2.cat;});});
                groups.push({key:u.key,label:u.label,emoji:u.emoji,items:items,subcats:hasSub?u.cats:null,subLabels:SUB_LABELS});
              }
            });
          }else if(sel.hsort==="orders"){
            var buckets=[{key:"heavy",label:"Heavy Rotation",sub:"15+ orders",emoji:"\uD83D\uDD25",min:15,max:Infinity},{key:"reg",label:"Regulars",sub:"5\u201314 orders",emoji:"\uD83D\uDCCA",min:5,max:14},{key:"occ",label:"Occasional",sub:"2\u20134 orders",emoji:"\uD83D\uDD04",min:2,max:4},{key:"once",label:"One and Done",sub:"Ordered once",emoji:"1\uFE0F\u20E3",min:1,max:1},{key:"zero",label:"Never Ordered",sub:"In system, 0 orders",emoji:"\uD83D\uDEAB",min:0,max:0}];
            buckets.forEach(function(b){var items=list.filter(function(r){return r.to>=b.min&&r.to<=b.max;});if(items.length>0)groups.push({key:b.key,label:b.label,emoji:b.emoji,items:items});});
          }else if(sel.hsort==="recent"){
            var now=Date.now();
            var rBuckets=[{key:"7d",label:"Last 7 Days",emoji:"\uD83D\uDD25",ms:7*86400000},{key:"30d",label:"Last 30 Days",emoji:"\uD83D\uDCC5",ms:30*86400000},{key:"90d",label:"Last 90 Days",emoji:"\uD83D\uDCC6",ms:90*86400000},{key:"older",label:"Older",emoji:"\uD83D\uDCA4",ms:Infinity}];
            var used={};
            rBuckets.forEach(function(b){var items=list.filter(function(r){if(used[r.id])return false;if(!r.ld)return b.ms===Infinity;var age=now-new Date(r.ld+"T12:00:00").getTime();return age<=b.ms;});items.forEach(function(r){used[r.id]=true;});if(items.length>0)groups.push({key:b.key,label:b.label,emoji:b.emoji,items:items});});
            var noDate=list.filter(function(r){return!r.ld&&!used[r.id];});
            if(noDate.length>0)groups.push({key:"never",label:"No Order Date",emoji:"\u2753",items:noDate});
          }else{
            var alpha=[{key:"af",label:"A \u2013 F"},{key:"gl",label:"G \u2013 L"},{key:"mr",label:"M \u2013 R"},{key:"sz",label:"S \u2013 Z"}];
            alpha.forEach(function(b){var lo=b.key[0].toUpperCase(),hi=b.key[1].toUpperCase();var items=list.filter(function(r){var c=(r.name||"")[0].toUpperCase();return c>=lo&&c<=hi;});if(items.length>0)groups.push({key:b.key,label:b.label,emoji:null,items:items});});
          }
          return <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {groups.map(function(grp){var open=hExp[grp.key];return <div key={grp.key}>
              <button onClick={function(){setHExp(function(prev){var n=Object.assign({},prev);n[grp.key]=!n[grp.key];return n;});}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+(open?"var(--ac)":"var(--bdr)"),background:open?"rgba(244,114,182,.04)":"var(--bg1)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}}>
                {grp.emoji&&<span style={{fontSize:16}}>{grp.emoji}</span>}
                <div style={{flex:1}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--tx1)"}}>{grp.label}</span>
                  {grp.sub&&<span style={{fontSize:11,color:"var(--tx3)",marginLeft:6}}>{grp.sub}</span>}
                </div>
                <span style={{fontSize:11,fontWeight:600,color:"var(--ac)",background:"rgba(244,114,182,.12)",padding:"2px 8px",borderRadius:10}}>{grp.items.length}</span>
                <span style={{fontSize:12,color:"var(--tx3)",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>{"\u25BC"}</span>
              </button>
              {open&&<div style={{marginTop:6,marginBottom:4}}>
                {grp.subcats?(function(){return grp.subcats.map(function(sc){var scItems=grp.items.filter(function(r){return(r.cat||"other")===sc;});if(scItems.length===0)return null;return <div key={sc} style={{marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4,paddingLeft:4}}>{grp.subLabels[sc]||sc}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {scItems.map(function(r){return <button key={r.id} onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:s.hf,hrid:r.id});});}} className="jfl-card" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                      <span style={{fontSize:20}}>{r.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontWeight:700,fontSize:13,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sn||r.name}</span>{r.fav&&<span style={{fontSize:8,fontWeight:700,color:"var(--ac)",background:"rgba(244,114,182,.15)",padding:"1px 4px",borderRadius:3,letterSpacing:.5,flexShrink:0}}>FAV</span>}</div>
                        <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{r.to+(r.to===1?" order":" orders")+(r.ld?" \u00B7 "+fmtDate(r.ld):"")}</div>
                      </div>
                    </button>;})}
                  </div>
                </div>;});})()
                :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {grp.items.map(function(r){return <button key={r.id} onClick={function(){setSel(function(s){return Object.assign({},s,{hf:"rest",hfPrev:s.hf,hrid:r.id});});}} className="jfl-card" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                    <span style={{fontSize:20}}>{r.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontWeight:700,fontSize:13,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sn||r.name}</span>{r.fav&&<span style={{fontSize:8,fontWeight:700,color:"var(--ac)",background:"rgba(244,114,182,.15)",padding:"1px 4px",borderRadius:3,letterSpacing:.5,flexShrink:0}}>FAV</span>}</div>
                      <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{r.to+(r.to===1?" order":" orders")+(r.ld?" \u00B7 "+fmtDate(r.ld):"")}</div>
                    </div>
                  </button>;})}
                </div>}
              </div>}
            </div>;})}
          </div>;
        })()}
        </div>}
      </div>;})()||null}
    </div>
    <BottomNav go={go} active="history" setSel={setSel}/>
  </div>}

  
  {/* ═══ SETTINGS ═══ */}
  {vw==="settings"&&<div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
    <div style={{flex:1,overflow:"auto"}}><SettingsPanel go={go} rests={rests} setR={setR} ppl={ppl} setPpl={setPpl} setSel={setSel} groups={groups} setGroups={setGroups} qrCustom={qrCustom} setQR={setQR} needsRefresh={needsRefresh} daysSinceRefresh={daysSinceRefresh} dataRefresh={dataRefresh} setDR={setDR} customMealTimes={customMealTimes} setMealTimes={setMealTimes} obvRules={activeObvRules} setObvRules={setObvRules} gs2={gs2} setGs2={setGs2}  onTheme={cycleTheme} theme={gs2.theme||"auto"} onInfo={function(){setAboutOpen(true);}} onLogo={function(){setLogoConfirm(true);}}/></div>
    <BottomNav go={go} active="settings" setSel={setSel}/>
  </div>}
</div>


);
}

var QUIZ_QS=[
{q:"Has it been a long day?",e:"😮‍💨",y:{c:2,tg:1},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Would {you} eat dessert right now?",e:"🍰",y:{st:3,tg:1},n:{h:1,b:1},w:["any"],m:"all"},
{q:"Does {time} feel like a treat-{yourself} moment?",e:"🎉",y:{st:2,tg:2},n:{h:2,sd:1},w:["any"],m:"all"},
{q:"Are {you} craving comfort food right now?",e:"🧀",y:{c:3},n:{h:2},w:["any"],m:"all"},
{q:"Would {you} feel better about a healthier choice?",e:"🌿",y:{h:3},n:{c:1,tg:1},w:["any"],m:"all"},
{q:"Are {you} too tired to care what {you} eat?",e:"😴",y:{sd:2,tg:1},n:{b:2},w:["any"],m:"all"},
{q:"Would a sweet treat make {time} better?",e:"🧁",y:{st:3},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Are {you} craving something with bold flavors?",e:"🌮",y:{c:1,tg:2},n:{sd:1,b:1},w:["any"],m:"all"},
{q:"Do {you} just want something simple and reliable?",e:"😌",y:{sd:3},n:{r:2},w:["any"],m:"all"},
{q:"Does something warm and carb-heavy sound amazing?",e:"🍝",y:{c:3,tg:1},n:{h:2},w:["any"],m:"all"},
{q:"Could {you} go for something greasy and satisfying?",e:"😋",y:{tg:3,c:1},n:{h:2},w:["any"],m:"all"},
{q:"Is {your} energy level basically at zero right now?",e:"🪫",y:{sd:2,c:1},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Would {you} say it's been a good day?",e:"☀️",y:{b:2,h:1},n:{c:2,tg:1},w:["any"],m:"all"},
{q:"Have {you} been eating too much junk lately?",e:"🫣",y:{h:3},n:{tg:1,c:1},w:["any"],m:"all"},
{q:"Do {you} genuinely not care what shows up?",e:"🤷‍♀️",y:{r:2,sd:1},n:{b:1},w:["any"],m:"all"},
{q:"Are {you} feeling active and energized right now?",e:"🏃‍♀️",y:{h:3},n:{c:1},w:["any"],m:"all"},
{q:"Would {you} describe {your} hunger right now as 'hangry'?",e:"😤",y:{tg:2,c:1},n:{b:1},w:["any"],m:"all"},
{q:"Is tonight a sweatpants-on-the-couch kind of night?",e:"🛋️",y:{c:3,tg:1},n:{b:1},w:["any"],m:"dinner,latenight"},
{q:"Is this a movie night kind of dinner?",e:"🎬",y:{c:2,st:1},n:{b:1},w:["any"],m:"dinner"},
{q:"Does takeout in bed sound perfect right now?",e:"🥡",y:{c:2,tg:1},n:{b:1},w:["any"],m:"dinner,latenight"},
{q:"Is tonight more of a wine night than a water night?",e:"🍷",y:{c:2,tg:1},n:{h:2},w:["any"],m:"dinner"},
{q:"Could a good glass of wine make tonight perfect?",e:"🍷",y:{c:1,tg:1,b:1},n:{h:2},w:["any"],m:"dinner"},
{q:"Are {you} a coffee-first kind of person today?",e:"☕",y:{b:2,sd:1},n:{st:1},w:["any"],m:"breakfast,brunch"},
{q:"Would pancakes make this morning perfect?",e:"🥞",y:{c:2,st:1},n:{h:2},w:["any"],m:"breakfast,brunch",ct:"breakfast"},
{q:"Are {you} in a 'just coffee and a pastry' mood?",e:"🥐",y:{sd:2,st:1},n:{h:1},w:["any"],m:"breakfast,brunch"},
{q:"Do {you} want something that will actually fuel {your} morning?",e:"💪",y:{h:3},n:{c:1},w:["any"],m:"breakfast,brunch"},
{q:"Would a big hearty breakfast set the tone for a good day?",e:"🍳",y:{c:2,b:1},n:{h:2},w:["any"],m:"breakfast,brunch"},
{q:"Is this a donuts-and-no-regrets kind of morning?",e:"🍩",y:{st:3,tg:1},n:{h:2},w:["any"],m:"breakfast,brunch",ct:"donuts"},
{q:"Are {you} trying to be good about breakfast today?",e:"🫐",y:{h:3},n:{c:1,st:1},w:["any"],m:"breakfast,brunch"},
{q:"Could {you} eat breakfast twice today?",e:"🤤",y:{tg:2,c:1},n:{h:1,b:1},w:["any"],m:"breakfast"},
{q:"Is it a smoothie-and-go kind of morning?",e:"🥤",y:{h:2,sd:1},n:{c:1},w:["any"],m:"breakfast,brunch",ct:"smoothie"},
{q:"Would an egg sandwich solve {your} morning?",e:"🥚",y:{b:2,sd:1},n:{st:1},w:["any"],m:"breakfast",ct:"breakfast"},
{q:"Is this a rushed lunch where speed matters?",e:"💼",y:{sd:2},n:{b:2,c:1},w:["any"],m:"lunch"},
{q:"Would a big lunch make the afternoon better?",e:"🍱",y:{c:2,tg:1},n:{h:2},w:["any"],m:"lunch"},
{q:"Are {you} going to regret a heavy lunch later?",e:"😬",y:{h:3},n:{tg:1,c:1},w:["any"],m:"lunch"},
{q:"Is this more of a sandwich-at-the-desk situation?",e:"🥪",y:{sd:2,b:1},n:{c:1},w:["any"],m:"lunch"},
{q:"Would a light lunch leave {you} starving by 3pm?",e:"😟",y:{c:2,tg:1},n:{h:2,b:1},w:["any"],m:"lunch"},
{q:"Are {you} eating lunch late enough that it's basically early dinner?",e:"🕐",y:{c:2},n:{b:1,h:1},w:["any"],m:"lunch"},
{q:"Could a really good salad actually hit the spot right now?",e:"🥗",y:{h:3},n:{c:1},w:["any"],m:"lunch"},
{q:"Would something sweet hit the spot right now?",e:"🍬",y:{st:3},n:{h:1},w:["any"],m:"lunch"},
{q:"Would {you} say {youre} actually hungry right now?",e:"🤔",y:{h:1,sd:1},n:{tg:2,st:1},w:["any"],m:"lunch"},
{q:"Is the afternoon slump hitting hard right now?",e:"😩",y:{st:1,c:1},n:{h:2},w:["any"],m:"lunch"},
{q:"Is this a midnight snack that got out of hand?",e:"🌙",y:{tg:2,st:1},n:{sd:1},w:["any"],m:"latenight"},
{q:"Are {you} going to pretend this didn't happen tomorrow?",e:"🤫",y:{tg:3},n:{h:1},w:["any"],m:"latenight"},
{q:"Would something warm and comforting help {you} sleep?",e:"🫕",y:{c:3},n:{h:1},w:["any"],m:"latenight"},
{q:"Is this a 'treat {yourself} because {youre} still awake' moment?",e:"🦉",y:{st:2,tg:1},n:{sd:1},w:["any"],m:"latenight"},
{q:"Could {you} actually go to bed without eating?",e:"🛏️",y:{h:1,b:1},n:{tg:2,c:1},w:["any"],m:"latenight"},
{q:"Is this a lazy brunch vibe?",e:"🌴",y:{c:2,b:1},n:{sd:1},w:["any"],m:"brunch"},
{q:"Would bottomless mimosas complete this brunch?",e:"🍊",y:{st:1,tg:1,b:1},n:{h:2},w:["any"],m:"brunch"},
{q:"Are {you} in a 'brunch is the best meal' mood?",e:"🥂",y:{b:2,st:1},n:{sd:1},w:["any"],m:"brunch"},
{q:"Would something sweet and savory together be perfect?",e:"🧇",y:{b:2,st:1},n:{h:1},w:["any"],m:"brunch"},
{q:"Do you feel like you earned something indulgent?",e:"🧘",y:{tg:2,st:2},n:{h:2,b:1},w:["jenna"],m:"all"},
{q:"Do you want {meal} to feel a little fancy?",e:"💅",y:{b:2,c:1},n:{sd:1,tg:1},w:["jenna"],m:"all"},
{q:"Are you in a 'be good to your body' mood?",e:"💚",y:{h:3},n:{c:1,tg:2},w:["jenna"],m:"all"},
{q:"Would you rather eat something homemade-feeling?",e:"👩‍🍳",y:{c:2,b:1},n:{tg:1},w:["jenna"],m:"all"},
{q:"Is this a candles-and-cozy kind of moment?",e:"🕯️",y:{c:2,b:1},n:{tg:1},w:["jenna"],m:"dinner"},
{q:"Would a warm bowl of something fix everything right now?",e:"🍜",y:{c:3},n:{st:1},w:["jenna"],m:"all"},
{q:"Are you in a 'salad and feel virtuous' headspace?",e:"🥬",y:{h:3},n:{c:2},w:["jenna"],m:"all"},
{q:"Do you want something that feels like a hug in food form?",e:"🤗",y:{c:3,sd:1},n:{h:1},w:["jenna"],m:"all"},
{q:"Would you pick a smoothie over a burger right now?",e:"🥤",y:{h:3},n:{c:2,tg:1},w:["jenna"],m:"all"},
{q:"Is {time} a 'pour a glass and order something nice' vibe?",e:"🥂",y:{c:1,tg:1,b:1},n:{h:2},w:["jenna"],m:"dinner"},
{q:"Would you rather have a really good small meal than a big cheap one?",e:"✨",y:{b:2,h:1},n:{tg:2},w:["jenna"],m:"all"},
{q:"Would a charcuterie board be the perfect {meal} right now?",e:"🍇",y:{b:2,st:1},n:{sd:1},w:["jenna"],m:"dinner"},
{q:"Are you in the mood for something a little bougie?",e:"💎",y:{b:2},n:{sd:1,tg:1},w:["jenna"],m:"all"},
{q:"Is this a treat-yourself-because-you-survived moment?",e:"🏆",y:{st:2,tg:2},n:{h:1},w:["jenna"],m:"all"},
{q:"Would a really good latte fix your mood right now?",e:"🫖",y:{b:2,h:1},n:{c:1,st:1},w:["jenna"],m:"breakfast,brunch"},
{q:"Are you secretly craving something terrible and delicious?",e:"🙊",y:{tg:3},n:{h:2},w:["jenna"],m:"all"},
{q:"Could you eat a whole burrito right now?",e:"🌯",y:{tg:3,c:1},n:{h:1},w:["kevin"],m:"all",ct:"mexican"},
{q:"Are you in a 'feed me anything large' mood?",e:"🦖",y:{tg:3,c:1},n:{h:1,b:1},w:["kevin"],m:"all"},
{q:"Does a double cheeseburger sound like it would hit right now?",e:"🍔",y:{tg:3},n:{h:2},w:["kevin"],m:"lunch,dinner,latenight",ct:"burgers"},
{q:"Would you rather eat something you can hold with one hand?",e:"🌮",y:{tg:2,sd:1},n:{b:1},w:["kevin"],m:"all"},
{q:"Does fried chicken sound perfect right now?",e:"🍗",y:{c:3,tg:1},n:{h:2},w:["kevin"],m:"all"},
{q:"Would you crush a plate of nachos right now?",e:"🫔",y:{tg:2,c:2},n:{h:1},w:["kevin"],m:"lunch,dinner,latenight",ct:"mexican"},
{q:"Is {time} a 'wings and something to watch' kind of {meal}?",e:"🍗",y:{c:2,tg:1},n:{h:1},w:["kevin"],m:"dinner,latenight",ct:"wings"},
{q:"Would a milkshake solve your problems?",e:"🧊",y:{st:2,c:1,tg:1},n:{h:1,b:1},w:["kevin"],m:"all"},
{q:"Do you feel like being responsible about food?",e:"📋",y:{h:2,b:2},n:{tg:3,st:1},w:["kevin"],m:"all"},
{q:"Would you eat an entire bag of fries right now?",e:"🍟",y:{tg:3,c:1},n:{h:2},w:["kevin"],m:"all"},
{q:"Are you actually kind of in the mood for something healthy?",e:"🌱",y:{h:3},n:{c:1,tg:1},w:["kevin"],m:"all"},
{q:"Would a rack of ribs make your day?",e:"🍖",y:{tg:3,c:1},n:{h:2},w:["kevin"],m:"dinner",ct:"bbq"},
{q:"Would a breakfast sandwich solve everything right now?",e:"🥓",y:{c:2,sd:1},n:{h:1},w:["kevin"],m:"breakfast,brunch"},
{q:"Is {time} more of a date night vibe?",e:"💕",y:{b:2,c:1},n:{sd:1},w:["couple"],m:"dinner"},
{q:"Would {you} both be happy with the same restaurant?",e:"🤝",y:{sd:2,cs:1},n:{r:1},w:["couple"],m:"all"},
{q:"Is {time} a 'let's try something different' kind of {meal}?",e:"🌟",y:{r:2,b:1},n:{sd:2},w:["couple"],m:"all"},
{q:"Should {meal} be the highlight of the evening?",e:"🎆",y:{b:2,c:1},n:{sd:1},w:["couple"],m:"dinner"},
{q:"Are {you} both too tired to have opinions?",e:"😴",y:{sd:3},n:{b:1,r:1},w:["couple"],m:"all"},
{q:"Would {you} share a dessert?",e:"🍫",y:{st:2,b:1},n:{h:1},w:["couple"],m:"all"},
{q:"Is one of you hungrier than the other right now?",e:"⚖️",y:{b:2,c:1},n:{sd:1},w:["couple"],m:"all"},
{q:"Is {time} a 'something nice together' moment?",e:"🥂",y:{b:2,c:1},n:{tg:1},w:["couple"],m:"all"},
{q:"Would {you} both agree on comfort food right now?",e:"🧡",y:{c:3},n:{h:1},w:["couple"],m:"all"},
{q:"Are {you} in sync about what sounds good?",e:"💫",y:{sd:2},n:{b:1,r:1},w:["couple"],m:"all"},
{q:"Could {you} both go for something light and easy?",e:"🌿",y:{h:2,b:1},n:{c:2},w:["couple"],m:"all"},
{q:"Is this a 'we both deserve this' kind of {meal}?",e:"👑",y:{tg:2,st:1},n:{h:1},w:["couple"],m:"all"},
{q:"Is {time} a no-kids quiet {meal}?",e:"🤫",y:{b:2,c:1},n:{sd:1},w:["couple"],m:"all"},
{q:"Would {you} both enjoy splitting a big order?",e:"🍱",y:{c:2,b:1},n:{sd:1},w:["couple"],m:"all"},
{q:"Do the kids need to be happy with this {meal} too?",e:"👧",y:{kp:3,cs:1},n:{tg:1},w:["kids"],m:"all"},
{q:"Is bedtime going to be chaos if {meal} isn't easy?",e:"👩‍👧‍👦",y:{kp:2,sd:2},n:{b:1},w:["kids"],m:"dinner"},
{q:"Are the kids already cranky?",e:"😫",y:{kp:2,sd:2},n:{b:1},w:["kids"],m:"all"},
{q:"Would the kids eat chicken nuggets and be perfectly happy?",e:"🐔",y:{kp:3},n:{b:1},w:["kids"],m:"all"},
{q:"Could the adults eat something different from the kids?",e:"🔀",y:{b:1,tg:1},n:{kp:2},w:["kids"],m:"all"},
{q:"Do {you} need {meal} to be on the table fast?",e:"⏰",y:{sd:2,kp:1},n:{b:1},w:["kids"],m:"all"},
{q:"Would the kids eat pizza and not complain?",e:"🍕",y:{kp:2,sd:1},n:{b:1},w:["kids"],m:"all",ct:"pizza"},
{q:"Is it worth trying something new with the kids?",e:"🎲",y:{b:1,r:1},n:{kp:2,sd:1},w:["kids"],m:"all"},
{q:"Would everyone be fine with something simple?",e:"✅",y:{sd:3,kp:1},n:{r:1},w:["kids"],m:"all"},
{q:"Are snacks going to turn into {meal} at this rate?",e:"🍿",y:{sd:1,st:1},n:{b:2},w:["kids"],m:"dinner"},
{q:"Is it a chicken-fingers-and-fries kind of {meal}?",e:"🐓",y:{kp:3,sd:1},n:{b:1},w:["kids"],m:"all"},
{q:"Are {you} trying to get the kids to eat something with nutrients?",e:"🥕",y:{h:2,kp:1,b:1},n:{sd:1},w:["kids"],m:"all"},
{q:"Would the kids survive if {meal} was a little adventurous?",e:"🗺️",y:{r:1,b:1},n:{kp:3},w:["kids"],m:"all"},
{q:"Is everyone going to want something different?",e:"🎪",y:{cs:2},n:{sd:2},w:["kids"],m:"all"},
{q:"Is anyone else going to have strong opinions about this?",e:"💬",y:{cs:3},n:{r:1,tg:1},w:["group"],m:"all"},
{q:"Can someone just pick for the group without a debate?",e:"📣",y:{cs:2,kp:1},n:{tg:1,r:1},w:["group"],m:"all"},
{q:"Would everyone be happy with a crowd-pleaser?",e:"👏",y:{cs:2,sd:1},n:{r:1},w:["group"],m:"all"},
{q:"Are there any picky eaters in the group?",e:"🙈",y:{kp:2,cs:1},n:{b:1},w:["group"],m:"all"},
{q:"Is {time} a sisters night?",e:"👯‍♀️",y:{b:2,st:1},n:{sd:1},w:["jenna-zoe"],m:"dinner"},
{q:"Would {you} split something indulgent guilt-free?",e:"🍰",y:{st:2,tg:1},n:{h:1},w:["jenna-zoe"],m:"all"},
{q:"Are {you} in the mood to try something new together?",e:"🆕",y:{r:2,b:1},n:{sd:2},w:["jenna-zoe"],m:"all"},
{q:"Is {time} a 'let's get something cute' vibe?",e:"🎀",y:{b:2,st:1},n:{tg:1},w:["jenna-zoe"],m:"all"},
{q:"Would {you} share a big dessert order and not feel bad?",e:"🍩",y:{st:3},n:{h:1},w:["jenna-zoe"],m:"all"},
{q:"Is this a gossip-over-good-food kind of {meal}?",e:"💅",y:{c:1,b:2},n:{sd:1},w:["jenna-zoe"],m:"all"},
{q:"Are {you} ordering just because {you} need fuel right now?",e:"🔋",y:{st:2,tg:1,b:1},n:{sd:1,h:1},w:["jenna-zoe"],m:"all"},
{q:"Would {you} be happy splitting a bunch of appetizers?",e:"🍢",y:{b:2,st:1},n:{c:1},w:["jenna-zoe"],m:"all"},
{q:"Is {time} a chill hangout with Leah?",e:"🎨",y:{c:2,b:1},n:{tg:1},w:["jenna-leah"],m:"all"},
{q:"Would {you} be happy with something cozy and easy?",e:"🫕",y:{c:2,sd:1},n:{r:1},w:["jenna-leah"],m:"all"},
{q:"Is this a 'catch up over comfort food' mood?",e:"💭",y:{c:2,b:1},n:{h:1},w:["jenna-leah"],m:"all"},
{q:"Is {time} more of a low-key hangout vibe?",e:"🪴",y:{sd:2,c:1},n:{tg:2,st:1},w:["jenna-leah"],m:"all"},
{q:"Would {you} enjoy something light and fresh?",e:"🌸",y:{h:2,b:1},n:{c:1},w:["jenna-leah"],m:"all"},
{q:"Is this a 'keep it simple and just talk' kind of {meal}?",e:"💬",y:{sd:2,b:1},n:{tg:1},w:["jenna-leah"],m:"all"},
{q:"Is Kevin's mom in the mood for something classic?",e:"👩‍🦳",y:{sd:2,c:1},n:{r:1},w:["kevin-mom-visit"],m:"all"},
{q:"Would {you} say Kevin's mom wants a sit-down-feeling meal {time}?",e:"🍽️",y:{b:2,c:1},n:{tg:1},w:["kevin-mom-visit"],m:"all"},
{q:"Is {time} about keeping it familiar and easy?",e:"🏡",y:{sd:3},n:{r:2},w:["kevin-mom-visit"],m:"all"},
{q:"Is Kevin's mom leaning toward something hearty and warm?",e:"🥘",y:{c:3},n:{h:1},w:["kevin-mom-visit"],m:"all"},
{q:"Is Kevin's mom going to want her own full plate?",e:"🤔",y:{cs:2,b:1},n:{sd:1},w:["kevin-mom-visit"],m:"all"},
{q:"Should {meal} feel a little special since Mom's here?",e:"💐",y:{b:2,c:1},n:{sd:1},w:["kevin-mom-visit"],m:"all"},
{q:"Would Kevin's mom be fine with whatever {you} pick?",e:"😊",y:{sd:2},n:{cs:1,b:1},w:["kevin-mom-visit"],m:"all"},
{q:"Are Jenna's parents going to want something they recognize?",e:"👴",y:{sd:3},n:{r:2},w:["jenna-parents-visit"],m:"all"},
{q:"Should {meal} feel a little nicer since the parents are here?",e:"🌷",y:{b:2,c:1},n:{sd:1},w:["jenna-parents-visit"],m:"all"},
{q:"Would Jenna's mom be happy with something comfortable?",e:"👵",y:{c:2,sd:1},n:{tg:1},w:["jenna-mom-visit"],m:"all"},
{q:"Is {time} a 'keep it crowd-friendly' situation?",e:"🎪",y:{cs:3,sd:1},n:{r:1},w:["jenna-parents-visit"],m:"all"},
{q:"Are Jenna's parents particular about what they eat?",e:"🧐",y:{cs:2,sd:1},n:{r:1},w:["jenna-parents-visit"],m:"all"},
{q:"Would something everyone at the table knows work best?",e:"📋",y:{sd:3,cs:1},n:{r:2},w:["jenna-parents-visit"],m:"all"},
{q:"Should {you} play it safe {time}?",e:"🎭",y:{b:2},n:{sd:2},w:["jenna-parents-visit"],m:"all"},
{q:"Is {time} more about survival than enjoyment?",e:"⚔️",y:{kp:1,sd:1},n:{b:2},w:["fam5"],m:"all"},
{q:"Are {you} hoping for leftovers tomorrow?",e:"🍱",y:{c:2,cs:1},n:{st:1},w:["fam5"],m:"all"},
{q:"Would the path of least resistance be the smart move?",e:"🧘",y:{sd:3,kp:1},n:{r:1},w:["fam5"],m:"all"},
{q:"Are the kids going to eat something different from the adults anyway?",e:"🔀",y:{kp:1,tg:1},n:{sd:2},w:["fam5"],m:"all"},
{q:"Could everyone agree on one restaurant if {you} tried?",e:"🤞",y:{cs:2,sd:1},n:{r:1},w:["fam5"],m:"all"},
{q:"Is bath time going to depend on how messy {meal} is?",e:"🛁",y:{kp:2,sd:1},n:{tg:1},w:["fam5"],m:"dinner"},
{q:"Would the kids notice if {you} ordered something different for {yourself}?",e:"🤫",y:{b:1,tg:1},n:{kp:2},w:["fam5"],m:"all"},
{q:"Is {time} a 'keep it easy for the whole family' kind of {meal}?",e:"🏠",y:{sd:3,kp:1},n:{r:1},w:["fam5"],m:"all"},
{q:"Is {time} a bit of a production with everyone here?",e:"🎬",y:{cs:3,sd:1},n:{r:1},w:["fam-plus-parents"],m:"all"},
{q:"Would something big and shareable feed everyone?",e:"🫂",y:{cs:2,c:1},n:{h:1},w:["fam-plus-parents"],m:"all"},
{q:"Are the grandparents going to spoil the kids with dessert anyway?",e:"🍦",y:{st:2,kp:1},n:{h:1},w:["fam-plus-parents"],m:"all"},
{q:"Is {time} a 'play it safe for the whole table' situation?",e:"🛡️",y:{sd:3,cs:1},n:{r:2},w:["fam-plus-parents"],m:"all"},
{q:"Would a family-style order that covers everyone be ideal?",e:"👨‍👩‍👧‍👦",y:{cs:2,c:1},n:{tg:1},w:["fam-plus-parents"],m:"all"},
{q:"Is everyone tired enough that easy wins out?",e:"😪",y:{sd:3},n:{b:1},w:["fam-plus-parents"],m:"all"},
{q:"Is Kevin's mom joining the chaos tonight?",e:"👩‍🦳",y:{cs:2,kp:1},n:{b:1},w:["fam-plus-kmom"],m:"dinner"},
{q:"Is Kevin's mom good with whatever the kids are having?",e:"🤷",y:{sd:2,kp:1},n:{b:1},w:["fam-plus-kmom"],m:"all"},
{q:"Should {meal} be extra good since Grandma's here?",e:"💕",y:{b:2,c:1},n:{sd:1},w:["fam-plus-kmom"],m:"all"},
{q:"Is {time} a 'big family table' kind of {meal}?",e:"🪑",y:{cs:2,c:1},n:{tg:1},w:["fam-plus-kmom"],m:"all"},
{q:"Would something everyone recognizes keep the peace?",e:"✌️",y:{sd:2,cs:1},n:{r:1},w:["fam-plus-kmom"],m:"all"},
{q:"Is this a full house situation?",e:"🏠",y:{cs:3,sd:1},n:{r:1},w:["big-family"],m:"all"},
{q:"Would one massive order feed the whole crew?",e:"📦",y:{cs:2,c:1},n:{h:1},w:["big-family"],m:"all"},
{q:"Are {you} going all out {time}?",e:"🎢",y:{sd:2},n:{tg:2,st:1},w:["big-family"],m:"all"},
{q:"Would something from a place with a big menu work best?",e:"📖",y:{cs:2,b:1},n:{sd:1},w:["big-family"],m:"all"},
{q:"Is someone going to end up ordering for everyone?",e:"👆",y:{sd:2,cs:1},n:{r:1},w:["big-family"],m:"all"},
{q:"Is {time} more about the company than the food?",e:"❤️",y:{sd:2,c:1},n:{b:2},w:["big-family"],m:"all"},
{q:"Do {you} have the patience to wait 45 minutes for really good food?",e:"⏳",y:{b:2,c:1},n:{sd:2},w:["any"],m:"all"},
{q:"Could a really good sandwich fix {your} whole day?",e:"🤌",y:{c:2,sd:1},n:{st:1},w:["any"],m:"all"},
{q:"Would {you} rather just pick the first thing that sounds good?",e:"📱",y:{b:1,r:1},n:{sd:3},w:["any"],m:"all"},
{q:"Would fries make everything better right now?",e:"🧂",y:{tg:2,c:1},n:{h:2},w:["any"],m:"all"},
{q:"Is tonight a '{we} earned this' kind of night?",e:"🏅",y:{tg:2,st:1},n:{h:1,sd:1},w:["any"],m:"dinner"},
{q:"Is tonight the kind of night where calories don't count?",e:"🎭",y:{tg:3,st:1},n:{h:2},w:["any"],m:"dinner,latenight"},
{q:"Are {you} in the mood to order way too much food?",e:"🤑",y:{tg:2,c:1},n:{h:1,b:1},w:["any"],m:"dinner"},
{q:"Would a perfect plate of pasta fix {your} entire week?",e:"🇮🇹",y:{c:3},n:{h:2},w:["any"],m:"dinner",ct:"italian"},
{q:"Would a breakfast burrito make this morning worth it?",e:"🌯",y:{c:2,tg:1},n:{h:1},w:["any"],m:"breakfast",ct:"mexican"},
{q:"Is it a 'two cups of coffee before speaking' kind of morning?",e:"☕",y:{sd:2},n:{b:1},w:["any"],m:"breakfast"},
{q:"Could {you} skip breakfast and just have a really good lunch?",e:"⏭️",y:{h:1},n:{c:2,tg:1},w:["any"],m:"breakfast"},
{q:"Are {you} a 'savory breakfast' person today?",e:"🥓",y:{c:2,b:1},n:{st:2},w:["any"],m:"breakfast,brunch"},
{q:"Would a wrap check all the boxes right now?",e:"🥙",y:{h:2,b:1},n:{c:1},w:["any"],m:"lunch"},
{q:"Is this a 'treat {yourself} at lunch' kind of day?",e:"💰",y:{tg:2,st:1,b:1},n:{sd:1},w:["any"],m:"lunch"},
{q:"Is this going to ruin dinner?",e:"🍪",y:{st:2,tg:1},n:{h:1,sd:1},w:["any"],m:"lunch"},
{q:"Is this a 'bad decisions taste better at night' situation?",e:"😈",y:{tg:3},n:{sd:1},w:["any"],m:"latenight"},
{q:"Would cereal count as dinner right now?",e:"🥣",y:{sd:2},n:{c:1},w:["any"],m:"latenight"},
{q:"Would {you} eat waffles at any time of day?",e:"🧇",y:{st:1,c:2},n:{h:1},w:["any"],m:"brunch",ct:"breakfast"},
{q:"Is brunch really just an excuse to eat breakfast and lunch at the same time?",e:"🤯",y:{tg:1,c:2},n:{h:1},w:["any"],m:"brunch"},
{q:"Would you describe your energy right now as 'running on fumes'?",e:"🔋",y:{sd:2,c:1},n:{b:1},w:["jenna"],m:"all"},
{q:"Is this a 'reward yourself for keeping tiny humans alive' moment?",e:"🏆",y:{tg:2,st:2},n:{h:1},w:["jenna"],m:"all"},
{q:"Would a açaí bowl actually make you happy right now?",e:"🫐",y:{h:3},n:{c:1},w:["jenna"],m:"breakfast,brunch"},
{q:"Would a really good grain bowl check all the boxes?",e:"🍚",y:{h:3,b:1},n:{tg:1},w:["jenna"],m:"lunch,dinner"},
{q:"Is this a Target-run-and-DoorDash kind of day?",e:"🎯",y:{sd:2,c:1},n:{b:1},w:["jenna"],m:"all"},
{q:"Would a glass of rosé pair well with whatever you order?",e:"🌸",y:{b:1,c:1,tg:1},n:{h:2},w:["jenna"],m:"dinner"},
{q:"Are you ordering for the 'real you' {time}?",e:"👩",y:{tg:2,st:1},n:{kp:1,h:1},w:["jenna"],m:"dinner"},
{q:"Do you need something that takes zero mental energy to decide?",e:"🧠",y:{sd:3},n:{r:1},w:["jenna"],m:"all"},
{q:"Would a warm cookie delivery make your entire week?",e:"🫠",y:{st:3},n:{h:1},w:["jenna"],m:"all"},
{q:"Would you eat a gas station burrito right now if it was in front of you?",e:"⛽",y:{tg:3},n:{b:1},w:["kevin"],m:"all",ct:"mexican"},
{q:"Is this a 'protein and carbs, nothing fancy' kind of mood?",e:"💪",y:{c:2,sd:1},n:{b:1},w:["kevin"],m:"all"},
{q:"Would you rather have one really good item than a bunch of okay ones?",e:"💎",y:{b:2},n:{tg:2},w:["kevin"],m:"all"},
{q:"Are you in the mood for something you'd find at a tailgate?",e:"🏈",y:{tg:2,c:2},n:{h:1},w:["kevin"],m:"lunch,dinner"},
{q:"Would you be happy if dinner was just meat and bread?",e:"🥩",y:{tg:2,c:1},n:{h:1,b:1},w:["kevin"],m:"dinner"},
{q:"Could you eat a whole sub by yourself right now?",e:"🥖",y:{tg:2,c:1},n:{h:1},w:["kevin"],m:"all"},
{q:"Is one of you going to pretend to be fine with whatever and then not be?",e:"🙃",y:{cs:2,sd:1},n:{b:1},w:["couple"],m:"all"},
{q:"Would {you} both actually agree on sushi right now?",e:"🍣",y:{b:2},n:{sd:1,c:1},w:["couple"],m:"dinner,lunch",ct:"asian"},
{q:"Is one of {you} going to end up picking for both of {you} {time}?",e:"🔄",y:{r:2,b:1},n:{sd:1},w:["couple"],m:"all"},
{q:"Would {you} both be happy with breakfast for dinner?",e:"🥞",y:{c:2,r:1},n:{sd:1},w:["couple"],m:"dinner"},
{q:"Would ordering from two different places be worth it {time}?",e:"🔀",y:{r:1,b:1},n:{sd:2},w:["couple"],m:"all"},
{q:"Are the kids going to ask 'what's for dinner' seventeen more times?",e:"🔊",y:{sd:2,kp:1},n:{b:1},w:["kids"],m:"dinner"},
{q:"Would the kids eat something if it came with fries?",e:"👧",y:{kp:2,sd:1},n:{h:1},w:["kids"],m:"all"},
{q:"Is tonight a 'bribe them with dessert' kind of night?",e:"🎁",y:{st:1,kp:2},n:{sd:1},w:["kids"],m:"dinner"},
{q:"Are the kids hangry enough that speed matters most?",e:"⚡",y:{sd:3,kp:1},n:{b:1},w:["kids"],m:"all"},
{q:"Would the kids notice if you snuck vegetables into something?",e:"🥦",y:{h:2,kp:1},n:{sd:1},w:["kids"],m:"all"},
{q:"Is bedtime close enough that speed matters?",e:"🕐",y:{sd:3,kp:1},n:{b:1},w:["kids"],m:"dinner"},
{q:"Are {you} mentally prepared for 'I don't like this' tonight?",e:"🫠",y:{kp:2,sd:1},n:{r:1,b:1},w:["kids"],m:"dinner"},
{q:"Is this a 'someone just pick something' situation?",e:"🫡",y:{sd:3},n:{cs:1},w:["group"],m:"all"},
{q:"Is this a 'we're not counting calories tonight' vibe?",e:"🎉",y:{tg:2,st:2},n:{h:2},w:["jenna-zoe"],m:"dinner"},
{q:"Is this a comfort food kind of hangout?",e:"🗺️",y:{c:3},n:{r:2},w:["jenna-zoe"],m:"all"},
{q:"Is this a low-effort, high-reward kind of {meal}?",e:"🏹",y:{sd:2,c:1},n:{r:1},w:["jenna-leah"],m:"all"},
{q:"Would Kevin's mom judge the usual order?",e:"👀",y:{b:2,h:1},n:{tg:2,sd:1},w:["kevin-mom-visit"],m:"all"},
{q:"Is Kevin's mom going to say 'oh, anything is fine' and then not mean it?",e:"🙄",y:{cs:2,sd:1},n:{b:1},w:["kevin-mom-visit"],m:"all"},
{q:"Would Jenna's dad eat literally anything {you} put in front of him?",e:"👴",y:{sd:2,tg:1},n:{cs:1},w:["jenna-dad-visit"],m:"all"},
{q:"Is Jenna's mom going to ask what everyone else is getting first?",e:"👵",y:{cs:2},n:{sd:1},w:["jenna-mom-visit"],m:"all"},
{q:"Can {you} picture everyone at the table happy with what shows up?",e:"😊",y:{cs:2,sd:1},n:{r:1},w:["fam5"],m:"all"},
{q:"Would the kids' mood right now survive a 40-minute delivery?",e:"⏰",y:{sd:2},n:{kp:1,b:1},w:["fam5"],m:"all"},
{q:"Is tonight a 'everyone eats in their own world' kind of dinner?",e:"🌎",y:{sd:1,kp:1},n:{cs:2},w:["fam5"],m:"dinner"},
{q:"Would a restaurant that has both salad and nuggets be the move?",e:"🥬",y:{cs:2,kp:1,b:1},n:{tg:1},w:["fam5"],m:"all"},
{q:"Would the grandparents rather eat somewhere they've been before?",e:"🏡",y:{sd:3},n:{r:1},w:["fam-plus-parents","fam-plus-kmom"],m:"all"},
{q:"Is {time} more about just surviving {meal}?",e:"📷",y:{b:2,cs:1},n:{sd:2},w:["fam-plus-parents","fam-plus-kmom"],m:"all"},
{q:"Are the grandparents going to say 'we'll just have a little something'?",e:"🤏",y:{sd:2,b:1},n:{c:1},w:["fam-plus-parents","fam-plus-kmom"],m:"all"},

{q:"Is it a burger night?",e:"🌃",y:{c:2},n:{b:1},w:["couple","fam5"],m:"dinner",ct:"burgers"},
{q:"Would fries and a burger fix everything?",e:"🛠️",y:{c:2,tg:1},n:{h:1},w:["any"],m:"dinner,latenight",ct:"burgers"},
{q:"Are {you} in a Chinese food mood?",e:"🥡",y:{c:2},n:{b:1},w:["any"],m:"dinner",ct:"asian"},
{q:"Would orange chicken and lo mein hit right now?",e:"🍊",y:{c:2,kp:1},n:{h:1},w:["fam5","couple"],m:"dinner",ct:"asian"},
{q:"Are {you} craving something with rice and a good sauce?",e:"🍚",y:{c:2,b:1},n:{h:1},w:["any"],m:"dinner",ct:"asian"},
{q:"Would naan and curry make {your} night?",e:"🍛",y:{c:2},n:{sd:1},w:["couple"],m:"dinner",ct:"indian"},
{q:"Are {you} craving something with bold spices and warm bread?",e:"🫓",y:{c:2},n:{sd:1},w:["any"],m:"dinner",ct:"indian"},
{q:"Is this more of a sub sandwich kind of day?",e:"🥖",y:{b:2},n:{c:1},w:["any"],m:"lunch",ct:"subs"},
{q:"Would a good deli sub be satisfying enough?",e:"📏",y:{b:2,sd:1},n:{c:1},w:["kevin","couple"],m:"lunch",ct:"subs"},
{q:"Is it a pizza kind of night?",e:"🍕",y:{c:2,kp:1},n:{h:1},w:["any"],m:"dinner",ct:"pizza"},
{q:"Would the whole family agree on pizza?",e:"🤝",y:{kp:2,cs:1},n:{b:1},w:["fam5"],m:"dinner",ct:"pizza"},
{q:"Is {time} a wings kind of {meal}?",e:"🦅",y:{c:2,tg:1},n:{h:1},w:["kevin","couple"],m:"dinner,latenight",ct:"wings"},
{q:"Would some barbecue make {your} day?",e:"🍖",y:{c:3},n:{h:1},w:["any"],m:"dinner",ct:"bbq"},
{q:"Is it a barbecue mood?",e:"🔥",y:{c:2},n:{b:1},w:["couple","fam5"],m:"dinner",ct:"bbq"},
{q:"Would a big plate of pasta fix {your} whole week?",e:"🍲",y:{c:2},n:{h:1},w:["couple","fam5"],m:"dinner",ct:"italian"},
{q:"Are {you} in an Italian food mood?",e:"🇮🇹",y:{c:2},n:{b:1},w:["any"],m:"dinner",ct:"italian"},
{q:"Would some Mexican food hit right now?",e:"🇲🇽",y:{c:2,tg:1},n:{h:1},w:["any"],m:"dinner,latenight",ct:"mexican"},
{q:"Is this a chips-and-salsa kind of night?",e:"🫔",y:{c:2,b:1},n:{h:1},w:["couple","fam5"],m:"dinner",ct:"mexican"},
{q:"Would a smoothie actually be enough right now?",e:"🫙",y:{h:2},n:{c:2},w:["any"],m:"breakfast,lunch,brunch",ct:"smoothie"},
{q:"Is it more of a drink than a meal kind of moment?",e:"🧃",y:{h:1},n:{c:2},w:["any"],m:"breakfast,lunch",ct:"smoothie"},
{q:"Is this a pancakes-and-syrup morning?",e:"🥞",y:{c:2,st:1},n:{h:1},w:["any"],m:"breakfast,brunch",ct:"breakfast"},
{q:"Would donuts make this morning better?",e:"🍩",y:{st:2,tg:1},n:{h:2},w:["any"],m:"breakfast",ct:"donuts"},
{q:"Are {you} in an eggs-and-bacon mood?",e:"🥚",y:{c:2},n:{st:2},w:["any"],m:"breakfast,brunch",ct:"breakfast"},
{q:"Are {you} feeling something lighter like froyo rather than full ice cream?",e:"🍦",y:{st:2,h:2},n:{tg:2,c:1},w:["any"],m:"dinner,latenight",ct:"froyo"},
{q:"Would frozen yogurt feel lighter and better right now?",e:"🍧",y:{st:2,h:2},n:{c:2},w:["jenna","couple"],m:"dinner,latenight",ct:"froyo"},
{q:"Are {you} willing to spend a little more for something really good?",e:"💰",y:{b:2},n:{tg:1,sd:1},w:["any"],m:"all",ct:"premium"},
{q:"Is this more of a cheap-and-fast situation?",e:"⚡",y:{tg:2,sd:1},n:{b:1},w:["any"],m:"all",ct:"budget"},
{q:"Is anyone else even awake right now?",e:"🌙",y:{tg:2},n:{b:1},w:["kevin"],m:"latenight",ct:"solo_late"},
{q:"Is this a between-you-and-God kind of order?",e:"🙏",y:{tg:3},n:{b:1},w:["kevin"],m:"latenight",ct:"solo_late"},
{q:"Would a bowl with grains and veggies actually satisfy {you}?",e:"🥙",y:{h:3},n:{c:2},w:["any"],m:"lunch,dinner",ct:"healthy"},
{q:"Is it a protein and rice bowl kind of night?",e:"🫛",y:{h:3,sd:1},n:{c:1},w:["jenna","couple"],m:"dinner",ct:"healthy"},
{q:"Are {you} just gonna order the same thing {you} always get?",e:"🔄",y:{sd:2},n:{r:2},w:["kevin"],m:"all"},
{q:"Is Kevin giving off 'I deserve this' energy tonight?",e:"👑",y:{tg:2,c:1},n:{h:1,b:1},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Are we betting Kevin would eat an entire rack of ribs and not share?",e:"🤤",y:{c:3,tg:1},n:{b:1},w:["couple","fam5"],m:"dinner",ct:"bbq"},
{q:"Is this a Kevin-sneaks-Taco-Bell-at-midnight situation?",e:"🥷",y:{tg:3},n:{b:1},w:["couple","fam5"],m:"latenight",ct:"mexican"},
{q:"Are {you} going to order the same thing {you} always get?",e:"🥩",y:{sd:2},n:{r:1,b:1},w:["kevin"],m:"lunch",ct:"subs"},
{q:"Is Jenna going to pick the healthy place before we even finish this quiz?",e:"🧑‍🍳",y:{h:2,sd:2},n:{r:1,c:1},w:["couple","fam5"],m:"dinner",ct:"healthy"},
{q:"Are {you} leaning healthy tonight?",e:"🥗",y:{h:3},n:{st:2,c:1},w:["any"],m:"dinner"},
{q:"Does it seem like Jenna would veto anything without a salad option?",e:"🙅",y:{h:2},n:{c:2},w:["couple","fam5"],m:"dinner"},
{q:"Do we think Jenna already knows what she wants?",e:"🤔",y:{sd:3},n:{r:2},w:["couple","fam5"],m:"all"},
{q:"Do we think Jenna would actually enjoy a cheeseburger tonight?",e:"🍔",y:{c:2},n:{h:2},w:["couple","fam5"],m:"dinner",ct:"burgers"},
{q:"Does Madi deserve a treat {time}?",e:"⭐",y:{st:2,kp:1},n:{kp:2},w:["fam5"],m:"all"},
{q:"Will Madi eat anything besides chicken nuggets tonight?",e:"👧",y:{b:1,kp:1},n:{kp:2,sd:1},w:["fam5"],m:"dinner",ct:"burgers"},
{q:"Is Madi going to melt down if we don\u2019t pick something she likes?",e:"😤",y:{kp:3,sd:1},n:{b:2},w:["fam5"],m:"all"},
{q:"Are we betting Madi would actually share her dessert?",e:"🧁",y:{st:1,kp:1},n:{st:2,tg:1},w:["fam5"],m:"dinner,latenight"},
{q:"Can Madi handle waiting long enough for a longer delivery?",e:"🪑",y:{b:1},n:{sd:2,kp:1},w:["fam5"],m:"dinner"},
{q:"Is Jack in a good enough mood to actually sit and eat?",e:"😊",y:{kp:1,b:1},n:{kp:3,sd:1},w:["fam5"],m:"dinner"},
{q:"Would Jack eat mac and cheese from literally anywhere right now?",e:"🧒",y:{kp:2,sd:1},n:{b:1},w:["fam5"],m:"dinner"},
{q:"Is Jack giving off chicken nuggets energy right now?",e:"🐥",y:{c:2,kp:1},n:{kp:2,sd:1},w:["fam5"],m:"dinner",ct:"burgers"},
{q:"Has Jack been a good boy {time}?",e:"😇",y:{st:1,kp:1},n:{kp:2},w:["fam5"],m:"all"},
{q:"Are we betting Jack would try something new tonight?",e:"🙃",y:{r:1,b:1},n:{kp:2,sd:1},w:["fam5"],m:"dinner"},
{q:"Does it seem like Emmy is going to eat actual food tonight?",e:"👶",y:{kp:1,b:1},n:{kp:2},w:["fam5"],m:"dinner"},
{q:"Does Emmy\u2019s meal even factor into this decision?",e:"🍼",y:{kp:2},n:{b:1},w:["fam5"],m:"all"},
{q:"Are we racing the clock before Emmy melts down?",e:"😴",y:{b:1,kp:1},n:{sd:2},w:["fam5"],m:"dinner,latenight"},
{q:"Is Jenna\u2019s dad going to ask if they can hold the sauce?",e:"🚫",y:{sd:2},n:{b:1},w:["jenna-dad-visit"],m:"dinner"},
{q:"Is Jenna\u2019s mom in a go-with-the-flow mood tonight?",e:"🇬🇧",y:{b:2},n:{h:1,sd:1},w:["jenna-mom-visit"],m:"dinner"},
{q:"Is Kevin\u2019s mom going to find a chicken sandwich no matter where we order from?",e:"🐔",y:{sd:3},n:{r:1},w:["kevin-mom-visit"],m:"dinner"},
{q:"Would Kevin\u2019s mom enjoy trying somewhere new?",e:"✨",y:{r:2},n:{sd:2},w:["kevin-mom-visit"],m:"dinner"},
{q:"Is Kevin\u2019s mom watching what she eats right now?",e:"🤗",y:{h:2},n:{c:2},w:["kevin-mom-visit"],m:"dinner"},
{q:"Does Zoe already have a plan for what she wants?",e:"💁",y:{sd:2},n:{r:1,b:1},w:["jenna-zoe"],m:"all"},
{q:"Would Zoe be up for something adventurous tonight?",e:"🌶️",y:{r:2},n:{sd:2,b:1},w:["jenna-zoe"],m:"dinner"},
{q:"Is Zoe leaning toward something healthy tonight?",e:"🤸",y:{h:2},n:{c:2},w:["jenna-zoe"],m:"dinner"},
{q:"Does it seem like Leah wants something Instagram-worthy?",e:"📸",y:{b:2},n:{sd:1,c:1},w:["jenna-leah"],m:"dinner"},
{q:"Is Leah good with fast food {time}?",e:"💫",y:{c:1,sd:1},n:{b:2},w:["jenna-leah"],m:"dinner"},
{q:"Is Leah in one of her 'whatever sounds good' moods?",e:"🤷",y:{b:2,r:1},n:{sd:2},w:["jenna-leah"],m:"all"},
{q:"Is anyone in this group going to be difficult about the choice?",e:"😬",y:{sd:2,cs:2},n:{b:2,r:1},w:["group","big-family"],m:"all"},
{q:"Does it seem like everyone can agree on one place?",e:"🗳️",y:{cs:2,sd:1},n:{b:2},w:["group","big-family"],m:"all"},
{q:"Is this a 'feed the army' situation?",e:"🪖",y:{cs:2},n:{sd:2},w:["group","big-family"],m:"dinner"},
{q:"Would a fresh bowl with protein hit the spot?",e:"🥙",y:{h:2,b:1},n:{c:2},w:["any"],m:"lunch,dinner",ct:"healthy"},
{q:"Is it a fried chicken kind of night?",e:"🍗",y:{c:2,tg:1},n:{h:1},w:["any"],m:"dinner,latenight",ct:"wings"},
{q:"Would hot chicken with some heat make your night?",e:"🔥",y:{c:2,tg:1},n:{sd:1},w:["kevin"],m:"dinner,latenight",ct:"wings"},
{q:"Could {you} crush some nachos right now?",e:"🧀",y:{c:2,tg:1},n:{h:1},w:["any"],m:"dinner,latenight",ct:"mexican"},
{q:"Is it a soup-and-sandwich kind of day?",e:"🥣",y:{b:2,h:1},n:{c:1},w:["any"],m:"lunch",ct:"subs"},
{q:"Would a big plate of BBQ with all the sides make everyone happy?",e:"🪵",y:{c:2,cs:1},n:{h:1},w:["fam5","group"],m:"dinner",ct:"bbq"},
{q:"Would a quesadilla make the kids stop complaining?",e:"🫔",y:{kp:2,c:1},n:{kp:1},w:["fam5"],m:"dinner",ct:"mexican"},
{q:"Are {you} in the mood for something you can customize — bowls, toppings, sauces?",e:"🎨",y:{b:2},n:{sd:1},w:["any"],m:"lunch,dinner",ct:"healthy"},
{q:"Would a dessert after {meal} seal the deal?",e:"🍪",y:{st:2},n:{h:1},w:["any"],m:"dinner"},
{q:"Is this a chicken sandwich and waffle fries kind of day?",e:"💛",y:{sd:3,c:1},n:{r:1,b:1},w:["any"],m:"lunch"},
{q:"Would Indian food hit different tonight?",e:"🍛",y:{c:2},n:{sd:1},w:["couple"],m:"dinner",ct:"indian"},
{q:"Is Kevin's mom going to insist we order too much food?",e:"🛒",y:{cs:2},n:{b:1},w:["kevin-mom-visit"],m:"dinner"},
{q:"Would Kevin's mom be horrified if we ordered late-night fast food tacos?",e:"😱",y:{b:2},n:{tg:2},w:["kevin-mom-visit"],m:"dinner,latenight"},
{q:"Is Kevin's mom in a 'I'll just have a salad' mood?",e:"🥗",y:{h:2},n:{c:2},w:["kevin-mom-visit"],m:"dinner",ct:"healthy"},
{q:"Is Jenna's dad in a hearty, no-nonsense kind of mood?",e:"🥩",y:{c:2,sd:1},n:{h:1},w:["jenna-dad-visit"],m:"dinner",ct:"burgers"},
{q:"Do we think Jenna's dad is up for trying something different tonight?",e:"✨",y:{r:1},n:{sd:2},w:["jenna-dad-visit"],m:"dinner"},
{q:"Is Jenna going to pretend she doesn't want fries and then eat all of yours?",e:"🫣",y:{c:1,st:1},n:{h:2},w:["couple"],m:"dinner"},
{q:"Are we betting Jenna would agree to a giant cookie delivery?",e:"🍪",y:{st:3},n:{h:2},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Is Jenna going to 'not be hungry' and then eat half of Kevin's order?",e:"😏",y:{b:2},n:{sd:1},w:["couple"],m:"dinner"},
{q:"Are {you} already feeling too full to eat a real meal?",e:"📊",y:{h:2},n:{tg:2,c:1},w:["kevin"],m:"dinner,latenight"},
{q:"Is Kevin going to order something responsible tonight?",e:"🤠",y:{h:2},n:{tg:2},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Are the kids just here for the fries tonight?",e:"😶",y:{kp:2},n:{b:1},w:["fam5","kids"],m:"dinner",ct:"burgers"},
{q:"Would the kids lose their minds if we got a box of fancy cookies?",e:"🤯",y:{st:3,kp:1},n:{kp:1},w:["fam5"],m:"dinner"},
{q:"Would chicken nuggets from literally anywhere make the kids happy?",e:"🏳️",y:{kp:3,sd:1},n:{b:1},w:["fam5"],m:"dinner"},
{q:"Is it one of those nights where we order the kids' food first and figure out ours after?",e:"🎯",y:{kp:3},n:{b:2},w:["fam5"],m:"dinner"},
{q:"Would a big fresh salad make you genuinely happy right now?",e:"🥗",y:{h:3},n:{c:2},w:["jenna","couple"],m:"lunch,dinner",ct:"healthy"},
{q:"Are {you} in the mood for something you eat with chopsticks?",e:"🥢",y:{c:2,b:1},n:{sd:1},w:["any"],m:"dinner",ct:"asian"},
{q:"Would a big greasy breakfast sandwich fix everything?",e:"🫡",y:{c:2,tg:1},n:{h:2},w:["kevin"],m:"breakfast",ct:"breakfast"},
{q:"Is it a queso-and-chips kind of night?",e:"🫠",y:{c:2},n:{h:1},w:["couple","fam5"],m:"dinner",ct:"mexican"},
{q:"Would a classic pepperoni pizza make everyone shut up and eat?",e:"🤐",y:{kp:2,c:1,cs:1},n:{h:1},w:["fam5","group"],m:"dinner",ct:"pizza"},
{q:"Are {you} craving something smoked and slow-cooked?",e:"💨",y:{c:3},n:{b:1},w:["any"],m:"dinner",ct:"bbq"},
{q:"Would a good deli sandwich be more satisfying than a fast food meal right now?",e:"🥪",y:{b:2},n:{tg:1,sd:1},w:["kevin","couple"],m:"lunch",ct:"subs"},
{q:"Is {time} a 'pasta in {your} pajamas' kind of night?",e:"🍝",y:{c:3},n:{b:1},w:["couple"],m:"dinner",ct:"italian"},
{q:"Would donuts and a breakfast sandwich hit different right now?",e:"☕",y:{sd:2,c:1},n:{b:1},w:["any"],m:"breakfast",ct:"breakfast"},
{q:"Would {you} add a milkshake to {your} order {time}?",e:"🥤",y:{st:2,c:1},n:{b:1},w:["any"],m:"dinner,latenight"},
{q:"Would fresh naan straight out of a tandoor make {your} night?",e:"🫓",y:{c:2},n:{sd:1},w:["couple"],m:"dinner",ct:"indian"},
{q:"Would {you} rather just point at a menu and eat?",e:"🎛️",y:{b:1},n:{sd:2},w:["any"],m:"lunch,dinner"},
{q:"Are {you} going to agree {time}, or is this a negotiation?",e:"🤝",y:{b:2},n:{cs:2},w:["couple"],m:"all"},
{q:"Is this a 'Jenna picks' kind of night?",e:"👩",y:{h:2,sd:1},n:{c:1,tg:1},w:["couple"],m:"dinner"},
{q:"Did Kevin already decide and he's just going through the motions?",e:"🎭",y:{sd:2},n:{r:1,b:1},w:["couple"],m:"all"},
{q:"Is Jenna's mom going to want her own full plate tonight?",e:"✂️",y:{b:2},n:{c:1},w:["jenna-mom-visit"],m:"dinner"},
{q:"Does it seem like Jenna's mom is in an 'I'll just pick at whatever' mood?",e:"🤷",y:{sd:2},n:{b:1},w:["jenna-mom-visit"],m:"dinner"},
{q:"Are Jenna's parents going to want something proper?",e:"🇬🇧",y:{b:2},n:{sd:1,c:1},w:["jenna-parents-visit"],m:"dinner"},
{q:"Is Jenna's dad going to need a plain, no-frills option?",e:"🫣",y:{c:1},n:{sd:2},w:["jenna-dad-visit"],m:"dinner"},
{q:"Is Kevin's mom going to eat half a sandwich and say she's stuffed?",e:"🥪",y:{sd:2},n:{c:1},w:["kevin-mom-visit"],m:"all"},
{q:"Would Kevin's mom enjoy splitting something with someone?",e:"✂️",y:{b:2,sd:1},n:{c:1},w:["kevin-mom-visit"],m:"dinner"},
{q:"Is Zoe going to have this sorted before anyone else has an opinion?",e:"⚡",y:{sd:2},n:{r:1},w:["jenna-zoe"],m:"all"},
{q:"Would Derek literally eat whatever Zoe decides?",e:"👍",y:{cs:2,sd:1},n:{b:1},w:["jenna-zoe"],m:"dinner"},
{q:"Is Corey going to be easy about this? Like, genuinely easy?",e:"🤙",y:{b:2},n:{cs:1},w:["jenna-leah"],m:"dinner"},
{q:"Does it seem like Tara wants something safe and familiar?",e:"🏡",y:{sd:2},n:{r:1},w:["big-family"],m:"dinner"},
{q:"Would Amanda be the one to suggest somewhere no one's tried before?",e:"🗺️",y:{r:2},n:{sd:1},w:["big-family"],m:"dinner"},
{q:"Do we need to order something Teddy-friendly off the floor {time}?",e:"🐕",y:{c:2,kp:1},n:{h:1},w:["fam5"],m:"dinner"},
{q:"Do we need enough dropped fries to keep Teddy happy {time}?",e:"🍟",y:{c:2},n:{h:1},w:["fam5"],m:"dinner"},
{q:"Is Teddy relying on dropped nuggets for his {meal} {time}?",e:"🐶",y:{kp:2,c:1},n:{b:1},w:["fam5"],m:"dinner"},
{q:"Do we think Madi already knows what she wants?",e:"💁",y:{sd:2,kp:1},n:{r:1},w:["fam5"],m:"all"},
{q:"Is Madi going to demand mac and cheese tonight?",e:"😤",y:{kp:2,sd:1},n:{b:1},w:["fam5"],m:"dinner"},
{q:"Do we need Madi's approval before picking a restaurant?",e:"👸",y:{kp:1,sd:1},n:{b:2},w:["fam5"],m:"dinner"},
{q:"Is Jack going to sit nicely and eat his protein tonight?",e:"💪",y:{b:1,kp:1},n:{kp:2},w:["fam5"],m:"dinner"},
{q:"Are we betting Jack would eat an entire plate of nuggets and ask for more?",e:"🦕",y:{kp:2,c:1},n:{kp:1},w:["fam5"],m:"dinner"},
{q:"Is Emmy just going to munch on whatever's in reach tonight?",e:"👶",y:{kp:1,b:1},n:{kp:2,sd:1},w:["fam5"],m:"dinner"},
{q:"Does it seem like Emmy can wait for delivery?",e:"🏃",y:{b:1,kp:1},n:{sd:2},w:["fam5"],m:"dinner"},
{q:"Is it a toppings-bar kind of night?",e:"🫐",y:{st:2,h:1},n:{c:1,tg:1},w:["any"],m:"dinner,latenight",ct:"froyo"},
{q:"Would a cup of froyo with fresh fruit actually hit the spot?",e:"🍓",y:{st:2,h:3},n:{c:2,tg:1},w:["jenna","couple"],m:"dinner,latenight",ct:"froyo"},
{q:"Would {you} pick quality over quantity {time}?",e:"✨",y:{b:2},n:{tg:1,sd:1},w:["any"],m:"all",ct:"premium"},
{q:"Is tonight worth splurging on something really satisfying?",e:"💎",y:{b:2,c:1},n:{sd:1},w:["any"],m:"dinner,latenight",ct:"premium"},
{q:"Is keeping it cheap more important than keeping it good?",e:"🏷️",y:{tg:1,sd:1},n:{b:2},w:["any"],m:"all",ct:"budget"},
{q:"Is the goal just to not be hungry anymore?",e:"🎯",y:{sd:2,tg:1},n:{b:1,c:1},w:["any"],m:"all",ct:"budget"},
{q:"Would a box of donuts solve {your} morning?",e:"📦",y:{st:2,tg:1},n:{h:2},w:["any"],m:"breakfast,brunch",ct:"donuts"},
{q:"Would {you} eat something right now that you'd never admit to in daylight?",e:"🕶️",y:{tg:3},n:{sd:1},w:["kevin"],m:"latenight",ct:"solo_late"},

{q:"Would {you} say the day went the way {you} wanted?",e:"🪞",y:{b:2,h:1},n:{c:2,tg:1},w:["any"],m:"all"},
{q:"Are {you} in a good headspace right now?",e:"🧠",y:{b:2,h:1},n:{c:2,tg:1},w:["any"],m:"all"},
{q:"Would {you} pay extra for something that really hits?",e:"💳",y:{b:2},n:{tg:1,sd:1},w:["any"],m:"all"},
{q:"Would eating something clean make {you} feel like a better person right now?",e:"🥬",y:{h:3},n:{c:1,tg:1},w:["any"],m:"all"},
{q:"Is this a fuel stop, not a food experience?",e:"⛽",y:{sd:2,tg:1},n:{b:1,c:1},w:["any"],m:"all"},
{q:"Would something fried and salty solve {your} problems right now?",e:"🧂",y:{tg:3,c:1},n:{h:2},w:["any"],m:"lunch,dinner,latenight"},
{q:"Is tonight a sugar kind of night?",e:"🍬",y:{st:3,tg:1},n:{h:1,b:1},w:["any"],m:"dinner,latenight"},
{q:"Do {you} need food to fix {your} mood right now?",e:"😮‍💨",y:{c:2,tg:1},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Would {you} trade speed for quality right now?",e:"⏱️",y:{b:2,c:1},n:{sd:2},w:["any"],m:"all"},
{q:"Is this a zero-effort kind of night?",e:"🛋️",y:{sd:2,tg:1},n:{b:2},w:["any"],m:"dinner,latenight"},
{q:"Could someone else pick and {youre} fine with it?",e:"🫠",y:{r:2,sd:1},n:{b:1},w:["any"],m:"all"},
{q:"Would a good sandwich be enough right now?",e:"🌯",y:{c:2,sd:1},n:{st:1},w:["any"],m:"lunch,dinner",ct:"subs"},
{q:"Does warm, heavy, filling food sound perfect right now?",e:"🫕",y:{c:3},n:{h:2},w:["any"],m:"dinner,latenight"},
{q:"Would picking the tried-and-true option feel like a relief?",e:"🔁",y:{sd:3},n:{r:2},w:["any"],m:"all"},
{q:"Are {you} running on empty right now?",e:"🔋",y:{sd:2,c:1},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Is {your} stomach making the decisions right now?",e:"🤤",y:{tg:2,c:1},n:{b:1},w:["any"],m:"all"},

{q:"Has one of {you} already been thinking about a specific place?",e:"\ud83d\udcad",y:{sd:2},n:{r:1,b:1},w:["couple"],m:"all"},
{q:"Is this going to require some compromising?",e:"\u2696\ufe0f",y:{b:2},n:{cs:2},w:["couple"],m:"all"},
{q:"Is this {meal} leaning more health-conscious than usual?",e:"\ud83c\udf4e",y:{h:3},n:{st:2,c:1},w:["couple","fam5"],m:"all"},
{q:"Do we think Jenna is good with what {we} actually want to order?",e:"\ud83d\udc40",y:{h:2},n:{tg:2},w:["couple","fam5"],m:"all"},
{q:"Does it seem like someone in this group already knows what they want?",e:"\ud83c\udfaf",y:{sd:3},n:{r:2},w:["couple","fam5"],m:"all"},
{q:"Would {you} both actually be happy with the same place {time}?",e:"\ud83e\udd1e",y:{b:2,sd:1},n:{cs:2},w:["couple"],m:"all"},
{q:"Is this a meet-in-the-middle kind of {meal}?",e:"\ud83e\udd1d",y:{b:2},n:{cs:2,sd:1},w:["couple"],m:"all"},
{q:"Would {you} say {youre} closer to unhinged than patient right now?",e:"\ud83d\ude35",y:{tg:2,c:1},n:{b:1},w:["any"],m:"all"},
{q:"Would {you} eat literally anything that showed up in the next ten minutes?",e:"\ud83d\udea8",y:{tg:2,c:1},n:{b:1},w:["any"],m:"all"},
{q:"Would a cookie fix everything right now?",e:"\ud83c\udf6a",y:{st:3,tg:1},n:{h:1,b:1},w:["any"],m:"all"},
{q:"Would a really solid hot meal beat a quick grab-and-go?",e:"\ud83c\udf72",y:{c:2,sd:1},n:{sd:1},w:["any"],m:"all"},
{q:"Is this more about the experience than just eating?",e:"\ud83c\udfad",y:{sd:2,tg:1},n:{b:1,c:1},w:["any"],m:"all"},
{q:"Would {you} say the day kicked {your} butt a little?",e:"\ud83d\udc80",y:{c:2,tg:1},n:{b:1,h:1},w:["any"],m:"all"},
{q:"Is comfort the priority tonight?",e:"\ud83e\uddf8",y:{c:2,tg:1},n:{b:1,h:1},w:["any"],m:"dinner,latenight"},
{q:"Have {you} earned something indulgent {time}?",e:"\ud83c\udfc5",y:{st:2,tg:2},n:{h:2,sd:1},w:["any"],m:"all"},
{q:"Would {you} feel guilty about ordering something purely for pleasure?",e:"\ud83d\ude07",y:{h:2,sd:1},n:{st:2,tg:2},w:["any"],m:"all"},
{q:"Is food the highlight of {your} evening right now?",e:"\ud83c\udf1f",y:{c:2,tg:1},n:{b:1,h:1},w:["any"],m:"dinner,latenight"},
{q:"Would {you} rather just go with what works than try something new?",e:"\ud83d\udee1\ufe0f",y:{sd:3},n:{r:2},w:["any"],m:"all"},
{q:"Is this a don\u2019t-overthink-it kind of {meal}?",e:"\ud83e\uddd8",y:{sd:2,tg:1},n:{b:2},w:["any"],m:"all"},
{q:"Would {you} wait a little longer if the food was way better?",e:"\u23f3",y:{b:2,c:1},n:{sd:2},w:["any"],m:"all"},
{q:"Would {you} rather eat something familiar than take a chance?",e:"\ud83c\udfb0",y:{sd:2},n:{r:3},w:["any"],m:"all"},
{q:"Are {you} the kind of hungry where everything sounds good?",e:"\ud83c\udf00",y:{tg:2,r:1},n:{sd:1},w:["any"],m:"all"},
{q:"Is {your} appetite more snack-sized than full-meal right now?",e:"\ud83d\udccf",y:{sd:1,h:1},n:{c:2,tg:1},w:["any"],m:"all"},
{q:"Would leftovers tomorrow be a bonus?",e:"\ud83d\udce6",y:{c:2,sd:1},n:{st:1},w:["any"],m:"dinner,latenight"},
{q:"Is spice welcome {time}, or are {you} playing it safe?",e:"\ud83c\udf36\ufe0f",y:{tg:1,c:1},n:{sd:2},w:["any"],m:"all"},
{q:"Is there a specific flavor stuck in {your} head right now?",e:"\ud83d\udd2e",y:{b:2,c:1},n:{sd:1,r:1},w:["any"],m:"all"},
{q:"Could {you} just eat a massive plate of fries and call it a night?",e:"\ud83c\udf5f",y:{tg:3,c:1},n:{h:1,b:1},w:["any"],m:"dinner,latenight"},
{q:"Would something with a lot of cheese make everything okay?",e:"\ud83e\uddc0",y:{c:3},n:{h:2},w:["any"],m:"all"},
{q:"Would breakfast food for {meal} be a power move right now?",e:"\ud83e\udd5e",y:{c:2,r:1},n:{sd:1},w:["any"],m:"dinner,latenight"},
{q:"Would soup hit different right now?",e:"\ud83e\udd63",y:{h:2,c:1},n:{tg:1},w:["any"],m:"dinner,latenight"},
{q:"Would rice make everything better right now?",e:"\ud83c\udf5a",y:{c:2,h:1},n:{tg:1},w:["any"],m:"dinner,latenight"},
{q:"Is this a no-dishes-no-cleanup kind of night?",e:"\ud83e\uddf9",y:{sd:2,tg:1},n:{b:1},w:["any"],m:"dinner,latenight"},
{q:"Are {you} in a feed-me-now kind of mood?",e:"\ud83d\udcf1",y:{sd:2,tg:1},n:{b:1,r:1},w:["any"],m:"all"},
{q:"Is tonight a we-should-probably-eat-vegetables kind of night?",e:"\ud83e\udd66",y:{h:3},n:{tg:2,c:1},w:["any"],m:"dinner"},
{q:"Would {you} skip the main course and just eat sides?",e:"\ud83e\udd57",y:{h:1,st:1},n:{c:2},w:["any"],m:"dinner"},
{q:"Would {you} say tonight is more about quantity than quality?",e:"\ud83c\udf7d\ufe0f",y:{tg:2,c:1},n:{b:2},w:["any"],m:"dinner,latenight"},
{q:"Is {time} a phones-down-and-enjoy-the-food kind of {meal}?",e:"\ud83d\udcf5",y:{b:2,c:1},n:{sd:1},w:["any"],m:"dinner,latenight"},

{q:"Would {you} all agree on something adventurous {time}?",e:"\ud83e\udded",y:{r:2,b:1},n:{sd:2},w:["couple","fam5"],m:"all"},
{q:"Is this going to require some diplomatic food choices?",e:"\ud83c\udff3\ufe0f",y:{cs:2,sd:1},n:{b:1,r:1},w:["couple","fam5"],m:"all"},
{q:"Would everyone at the table be okay with something spicy?",e:"\ud83e\udea8",y:{tg:1,c:1},n:{sd:2},w:["couple","fam5"],m:"all"},
{q:"Is there a restaurant {you} have been meaning to try together?",e:"\ud83d\udccc",y:{r:2,b:1},n:{sd:2},w:["couple","fam5"],m:"all"},
{q:"Would {you} all be satisfied with a big shareable order?",e:"\ud83e\udd59",y:{c:2,cs:1},n:{b:1},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Is this a night where everyone gets exactly what they want?",e:"\ud83c\udf81",y:{b:2},n:{cs:2,sd:1},w:["couple","fam5"],m:"all"},
{q:"Are Jenna\u2019s parents going to be easy about {time}\u2019s pick?",e:"\ud83e\udee1",y:{sd:2},n:{cs:2},w:["jenna-parents-visit"],m:"all"},
{q:"Would something crowd-friendly keep the peace with Jenna\u2019s parents?",e:"\ud83c\udf89",y:{cs:2,sd:1},n:{r:1},w:["jenna-parents-visit"],m:"all"},
{q:"Can we get away with something casual with Jenna\u2019s parents?",e:"\ud83c\udf96\ufe0f",y:{b:2},n:{sd:2,tg:1},w:["jenna-parents-visit"],m:"dinner"},

{q:"Do we think Kevin is going to order the same thing he always gets?",e:"\ud83d\udd01",y:{sd:3},n:{r:2},w:["couple","fam5"],m:"all"},
{q:"Would {you} actually try somewhere brand new tonight?",e:"\ud83c\udf1f",y:{r:3},n:{sd:2},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Is Kevin secretly hoping for something unhealthy tonight?",e:"\ud83e\udd2b",y:{tg:2,c:1},n:{h:1,b:1},w:["couple","fam5"],m:"dinner,latenight"},
{q:"Would Jenna let Kevin pick without any input {time}?",e:"\ud83d\ude4a",y:{sd:2,tg:1},n:{b:2},w:["couple","fam5"],m:"all"},
{q:"Is Jenna looking for something she can feel good about ordering?",e:"\ud83d\udc9a",y:{h:3},n:{c:2},w:["couple","fam5"],m:"all"},
{q:"Are {you} on the same page about how hungry {you} are?",e:"\ud83d\udcd6",y:{b:2},n:{cs:2},w:["couple","fam5"],m:"all"},
{q:"Are we betting Kevin would eat the entire order before Jenna finishes choosing?",e:"\ud83c\udfc3",y:{tg:2,sd:1},n:{b:1},w:["couple"],m:"all"},
{q:"Is Jenna going to change her mind at least once before ordering?",e:"\ud83d\udd04",y:{r:1,b:1},n:{sd:2},w:["couple"],m:"all"},

{q:"Would {you} feel better if {meal} had at least one green thing in it?",e:"\ud83e\udd6c",y:{h:3},n:{c:1,tg:1},w:["any"],m:"all"},
{q:"Is quick and easy more important than amazing right now?",e:"\u26a1",y:{sd:2,tg:1},n:{b:2,c:1},w:["any"],m:"all"},
{q:"Would {you} sacrifice taste for speed {time}?",e:"\ud83c\udfc1",y:{sd:2,tg:1},n:{b:2},w:["any"],m:"all"},
{q:"Does the idea of waiting for food make {you} want to scream?",e:"\ud83d\ude29",y:{sd:2,tg:1},n:{b:2,c:1},w:["any"],m:"all"},
{q:"Would {you} rather spend less and eat sooner?",e:"\ud83d\udcb8",y:{tg:2,sd:1},n:{b:1},w:["any"],m:"all"},
{q:"Is tonight more about nourishing {your} body than indulging?",e:"\ud83e\uddd1\u200d\ud83c\udf73",y:{h:2},n:{c:2,tg:1},w:["any"],m:"dinner,latenight"},
];
var QUIZ_MAP={h:"healthy",b:"balanced",c:"comfort",tg:"trash-goblin",st:"sweet-treat",kp:"kid-peace",cs:"crowd-survival",sd:"safe-default",r:"roulette"};

function MoodQuiz(props){
var sel=props.sel,up=props.up,mctx=props.mctx,resolve=props.resolve,go=props.go;
var _qs=useState(null);var qs=_qs[0],setQs=_qs[1];
var _ans=useState({});var ans=_ans[0],setAns=_ans[1];
var _round=useState(0);var round=_round[0],setRound=_round[1];
var _used=useState([]);var used=_used[0],setUsed=_used[1];
var usedRef=useRef([]);
var _pend=useState({});var pend=_pend[0],setPend=_pend[1];
var _resolved=useState(null);var resolved=_resolved[0],setResolved=_resolved[1];
var _disagrees=useState(0);var disagrees=_disagrees[0],setDisagrees=_disagrees[1];
var _h2h=useState(null);var h2h=_h2h[0],setH2H=_h2h[1];
var _h2hIntro=useState(false);var h2hIntro=_h2hIntro[0],setH2hIntro=_h2hIntro[1];
var _mode=useState(sel.qrLabel?"quiz":"choose");var mode=_mode[0],setMode=_mode[1];/* choose, quiz, direct */
var _phase=useState(sel.qrLabel?"narrow":"mood");var phase=_phase[0],setPhase=_phase[1];/* mood, narrow */
var _p2ct=useState(0);var p2count=_p2ct[0],setP2count=_p2ct[1];/* phase 2 answer count */
var _dc=useState(false);var directConfirm=_dc[0],setDirectConfirm=_dc[1];
var _dis=useState(false);var dismiss=_dis[0],setDismiss=_dis[1];

var FEMALE_IDS=["jenna","madi","emmy","jenna-mom","kevin-mom","zoe","leah","tara","amanda","zara"];
var ppl=props.ppl||[];
/* voters = non-baby/toddler people in the selection */
var guestCount=(sel.xa||0)+(sel.xk||0);
var guestVoter=guestCount>0?{id:"_guest",name:guestCount===1?"Guest":guestCount+" Guests",emoji:"\uD83D\uDC64",age:"adult",g:"m",freq:"occasional",adv:.5,hc:.5,sp:.5,meat:.5,sweet:.5}:null;
var voters=(sel.sp||[]).map(function(id){return ppl.find(function(p){return p.id===id;});}).filter(function(p){return p&&p.age!=="baby"&&p.age!=="toddler";});
if(guestVoter)voters=voters.concat([guestVoter]);

useEffect(function(){if(mode==="quiz"&&!qs&&(phase==="mood"||phase==="narrow"))pickQuestions([]);},[mode,phase,qs]);

function getQuizTags(){
var sp=sel.sp||[];var has=function(id){return sp.indexOf(id)>=0;};
var kidIds=["madi","jack","emmy","wyatt","beckham","zara"];
var hasKids=sp.some(function(id){return kidIds.indexOf(id)>=0;})||(sel.xk||0)>0;
var coreKids=["madi","jack","emmy"];
var hasCoreKids=coreKids.every(function(id){return sp.indexOf(id)>=0;});
var total=sp.length+(sel.xa||0)+(sel.xk||0);
var isGroup=total>3;
var hasKevin=has("kevin"),hasJenna=has("jenna");
var hasZoe=has("zoe"),hasLeah=has("leah");
var hasKMom=has("kevin-mom");
var hasJMom=has("jenna-mom"),hasJDad=has("jenna-dad");
var hasJParents=hasJMom||hasJDad;


var tags=["any"];
/* Solo */
if(sp.length===1&&hasKevin)tags.push("kevin");
if(sp.length===1&&hasJenna)tags.push("jenna");
/* Couple no kids */
if(hasKevin&&hasJenna&&!hasKids&&total===2)tags.push("couple");
/* Individual presence in multi */
if(hasJenna&&sp.length>1)tags.push("jenna");
if(hasKevin&&sp.length>1)tags.push("kevin");
/* Kids */
if(hasKids)tags.push("kids");
/* Group */
if(isGroup)tags.push("group");
/* Jenna + Zoe */
if(hasJenna&&hasZoe)tags.push("jenna-zoe");
/* Jenna + Leah */
if(hasJenna&&hasLeah)tags.push("jenna-leah");
/* Kevin + Kevin's Mom */
if(hasKevin&&hasKMom)tags.push("kevin-mom-visit");
/* Jenna's parents present */
if(hasJMom)tags.push("jenna-mom-visit");
if(hasJDad)tags.push("jenna-dad-visit");
if(hasJParents&&sp.length>1)tags.push("jenna-parents-visit");
/* Family of 5 */
if(hasKevin&&hasJenna&&hasCoreKids)tags.push("fam5");
/* Family + Jenna's parents */
if(hasKevin&&hasJenna&&hasCoreKids&&hasJParents)tags.push("fam-plus-parents");
/* Family + Kevin's Mom */
if(hasKevin&&hasJenna&&hasCoreKids&&hasKMom)tags.push("fam-plus-kmom");
/* Big family (8+ or lots of extended) */
if(total>=8)tags.push("big-family");

return tags;


}

function pickQuestions(usedList,forcePhase){
var currentPhase=forcePhase||phase;
var tags=getQuizTags();
var meal=mctx.meal;
var usedTexts=usedList;
var avail=QUIZ_QS.filter(function(q,i){
if(usedTexts.indexOf(q.q)>=0)return false;
if(!q.w.some(function(t){return tags.indexOf(t)>=0;}))return false;
if(q.m!=="all"){var meals=q.m.split(",");if(meals.indexOf(meal)<0)return false;}
return true;
});
/* Separate personality Qs (contain names/teasing) from regular */
var personalNames=["Kevin","Jenna","Madi","Jack","Emmy","Zoe","Leah","Teddy"];
var personality=[],regular=[];
avail.forEach(function(q){var isP=personalNames.some(function(n){return q.q.indexOf(n)>=0;});if(isP)personality.push(q);else regular.push(q);});
/* In narrowing phase, prioritize cuisine-tagged questions */
if(currentPhase==="narrow"){
var ctQuestions=[],otherQuestions=[];
regular.forEach(function(q){if(q.ct)ctQuestions.push(q);else otherQuestions.push(q);});
ctQuestions.sort(function(){return Math.random()-.5;});
otherQuestions.sort(function(){return Math.random()-.5;});
regular=ctQuestions.concat(otherQuestions);
}else{
regular.sort(function(){return Math.random()-.5;});
}
/* Shuffle personality */
personality.sort(function(){return Math.random()-.5;});
/* Pick max 1 personality + fill rest with regular, NO duplicate emojis */
var picked=[];
var usedEmojis=[];
function canPick(q){return usedEmojis.indexOf(q.e)<0;}
if(personality.length>0){var pq=personality.find(canPick);if(pq){picked.push(pq);usedEmojis.push(pq.e);}}
for(var ri=0;ri<regular.length&&picked.length<3;ri++){if(canPick(regular[ri])){picked.push(regular[ri]);usedEmojis.push(regular[ri].e);}}
/* If not enough regular, fill from personality */
for(var pi=0;pi<personality.length&&picked.length<3;pi++){if(picked.indexOf(personality[pi])<0&&canPick(personality[pi])){picked.push(personality[pi]);usedEmojis.push(personality[pi].e);}}
/* Shuffle final order so personality Q isn't always first */
picked.sort(function(){return Math.random()-.5;});
setQs(picked);
var newUsed=usedList.concat(picked.map(function(q){return q.q;}));
setUsed(newUsed);
usedRef.current=newUsed;
}

var totalSp=(sel.sp||[]).length+(sel.xa||0)+(sel.xk||0);
var isSolo=totalSp<=1;
var isDuo=totalSp===2;
var youWord=isSolo?"you":isDuo?"you two":"you all";
var youreWord=isSolo?"you're":isDuo?"you two are":"you all are";
var yourWord=isSolo?"your":isDuo?"your":"everyone's";
var weWord=isSolo?"you":isDuo?"you two":"we";

var yourselfWord=isSolo?"yourself":isDuo?"yourselves":"yourselves";

function fmtDesc(text){
if(!text)return text;
return text.replace("Surprise me","Surprise "+(isSolo?"me":"us")).replace("I\u2019m feeling lucky",(isSolo?"I\u2019m":"we\u2019re")+" feeling lucky");
}

function fmtQ(text){
var timeWord=mctx.meal==="breakfast"||mctx.meal==="brunch"||mctx.meal==="lunch"?"today":"tonight";
return text.replace(/{time}/g,timeWord).replace(/{meal}/g,mctx.label.toLowerCase()).replace(/{you}/g,youWord).replace(/{youre}/g,youreWord).replace(/{your}/g,yourWord).replace(/{we}/g,weWord).replace(/{yourself}/g,yourselfWord);
}




var REVEAL={
healthy:isSolo?"Your body called. It said thank you.":"Everyone's body called. They said thank you.",
balanced:"The Goldilocks zone. Smart move.",
comfort:"Sometimes the soul needs carbs.",
"trash-goblin":"No rules. No regrets. Let\u2019s go.",
"sweet-treat":"Life is short. Eat dessert.",
"kid-peace":"Path of least resistance activated.",
"crowd-survival":"Democracy is hard. Food shouldn\u2019t be.",
"safe-default":"If it ain\u2019t broke, order it again.",
roulette:"Chaos mode engaged. Buckle up."
};

if(resolved){
/* ═══ NARROW H2H REVEAL ═══ */
if(resolved.narrowH2H){
return <div className="fade">
<div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",background:"var(--bg0)"}}>
<TopBar title={"\u2694\uFE0F Tiebreaker Complete"}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px",position:"relative"}}>
{/* Glow */}
<div style={{position:"absolute",width:250,height:250,borderRadius:"50%",background:"linear-gradient(135deg,var(--ac),#C4956A)",opacity:.08,filter:"blur(80px)",top:"12%"}}></div>
{/* Swords icon */}
<div className="tada" style={{fontSize:64,marginBottom:20}}>{"\u2694\uFE0F"}</div>
<div className="pop" style={{fontSize:24,fontWeight:700,color:"var(--tx1)",textAlign:"center",animationDelay:".1s"}}>{"That was a fight."}</div>
<div className="pop" style={{fontSize:15,color:"var(--tx2)",marginTop:8,textAlign:"center",animationDelay:".25s"}}>{"But we made it to the other side."}</div>
{/* Method badge */}
{resolved.method&&resolved.method!=="Majority"&&<div className="pop" style={{marginTop:20,padding:"8px 18px",borderRadius:20,background:"var(--bg2)",border:"1px solid var(--bdr)",animationDelay:".4s",display:"flex",alignItems:"center",gap:5}}>
<span style={{fontSize:12,fontWeight:500,color:"var(--tx3)"}}>{"\u2694\uFE0F Decided by"}</span>
<span style={{fontSize:12,fontWeight:700,color:"var(--ac)"}}>{resolved.method}</span>
</div>}
{/* Anticipation teaser */}
<div className="pop" style={{marginTop:30,textAlign:"center",animationDelay:".6s"}}>
<div style={{fontSize:40,marginBottom:8}}>{"🍽️"}</div>
<div style={{fontSize:13,color:"var(--tx3)",fontWeight:600,letterSpacing:.5}}>{"Your pick is ready."}</div>
</div>
</div>
{/* CTA */}
<div style={{padding:"20px 24px 70px"}}>
<button className="jfl-cta" onClick={function(){setResolved(null);resolve();}} style={{padding:16,fontSize:16,fontWeight:700}}>{"\uD83D\uDE80 Show me the results"}</button>
<button className="jfl-btn" style={{width:"100%",marginTop:10}} onClick={function(){go("dashboard");}}>Start over</button>
</div>
</div>
</div>;
}
/* ═══ PHASE 1 MOOD LOCKED ═══ */
return <div className="fade">
<div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",background:"var(--bg0)"}}>
<TopBar title="Mood locked in" sub={sel.qrLabel?(sel.qrEmoji+" "+sel.qrLabel):""}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px",position:"relative"}}>
{/* Glow backdrop */}
<div style={{position:"absolute",width:180,height:180,borderRadius:"50%",background:resolved.c,opacity:.08,filter:"blur(60px)",top:"18%"}}></div>
{/* Emoji with ring */}
<div className="pop" style={{width:100,height:100,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg1)",border:"2px solid "+resolved.c,boxShadow:"0 0 30px "+(resolved.c||"var(--ac)")+"33",position:"relative",zIndex:1}}>
<span style={{fontSize:48}}>{resolved.emoji}</span>
</div>
{/* Mood name */}
<div className="pop" style={{fontSize:28,fontWeight:700,color:resolved.c,marginTop:20,animationDelay:".1s"}}>{resolved.label}</div>
{/* Reveal tagline */}
<div className="pop" style={{fontSize:15,color:"var(--tx1)",marginTop:10,textAlign:"center",fontWeight:500,lineHeight:"1.5",animationDelay:".2s"}}>{REVEAL[resolved.id||"balanced"]||fmtDesc(resolved.desc)}</div>
{/* Description */}
<div className="pop" style={{fontSize:12,color:"var(--tx2)",marginTop:8,animationDelay:".3s"}}>{fmtDesc(resolved.desc)}</div>
{/* H2H method badge */}
{resolved.method&&<div className="pop" style={{marginTop:16,padding:"8px 18px",borderRadius:20,background:"var(--bg2)",border:"1px solid var(--bdr)",animationDelay:".4s",display:"flex",alignItems:"center",gap:5}}>
<span style={{fontSize:12,fontWeight:500,color:"var(--tx3)"}}>{"\u2694\uFE0F Decided by"}</span>
<span style={{fontSize:12,fontWeight:700,color:"var(--ac)"}}>{resolved.method}</span>
</div>}
</div>
{/* H2H voter breakdown */}
{resolved.personMoods&&<div style={{padding:"0 24px"}}>
<div style={{fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>How everyone voted</div>
{voters.map(function(v){
var mk=resolved.personMoods[v.id];
var moodId=QUIZ_MAP[mk]||"balanced";
var mood=MOODS.find(function(m){return m.id===moodId;});
return <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--bdr)"}}>
<span style={{fontSize:18}}>{v.emoji}</span>
<span style={{fontSize:13,fontWeight:600,color:"var(--tx1)",flex:1}}>{v.name}</span>
<span style={{fontSize:16}}>{mood?mood.emoji:""}</span>
<span style={{fontSize:12,fontWeight:600,color:mood?mood.c:"var(--tx2)"}}>{mood?mood.label:"Balanced"}</span>
</div>;
})}
</div>}
{/* Buttons */}
<div style={{padding:"20px 24px 70px"}}>
<button className="jfl-cta" onClick={function(){setPhase("narrow");setP2count(0);setResolved(null);setH2H(null);setDisagrees(0);setRound(0);pickQuestions(usedRef.current,"narrow");}} style={{marginBottom:10,padding:16,fontSize:16,fontWeight:700}}>{"Now let\u2019s narrow it down"}</button>
<button className="jfl-btn" style={{width:"100%"}} onClick={function(){go("dashboard");}}>Start over</button>
</div>
</div>
</div>;
}

/* ═══ CHOOSE MODE ═══ */
if(mode==="choose"){
var whoNames=(sel.sp||[]).map(function(id){var p=ppl.find(function(pp){return pp.id===id;});return p?p.name:id;});
var whoEmoji=(sel.sp||[]).map(function(id){var p=ppl.find(function(pp){return pp.id===id;});return p?p.emoji:"";});
var guestCt=(sel.xa||0)+(sel.xk||0);
var guestLabel=guestCt===1?"a Guest":(guestCt+" Guests");
if(guestCt>0){whoEmoji=whoEmoji.concat(["\uD83D\uDC64"]);}
var totalPeople=(sel.sp||[]).length+guestCt;
var greeting=whoNames.length===1&&guestCt===0?"Alright "+whoNames[0]+",":(whoNames.length===1&&guestCt>0?whoNames[0]+" & "+guestLabel+",":(whoNames.length===2&&guestCt===0?whoNames[0]+" & "+whoNames[1]+",":(guestCt>0?"Okay team + "+guestLabel+",":"Okay team,")));
/* For 6+ people, try to match a group */
var groupMatch6=null;
if(totalPeople>=6){var spSorted=(sel.sp||[]).slice().sort().join(",");var allGroups=props.groups||[];for(var gi=0;gi<allGroups.length;gi++){var g=allGroups[gi];if(g.people.slice().sort().join(",")===spSorted){groupMatch6=g;break;}}}
return <div className="fade">
<TopBar title="What's the mood?"  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,overflow:"auto",padding:"20px 24px"}}>
{/* Who's eating */}
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:20}}>
{totalPeople>=6?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
<div style={{position:"relative"}}>
<div style={{position:"absolute",width:80,height:80,borderRadius:"50%",background:"rgba(140,180,255,.3)",filter:"blur(24px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}></div>
<span style={{fontSize:52,position:"relative",zIndex:1}}>{"\uD83D\uDC65"}</span>
</div>
<div style={{display:"inline-flex",alignItems:"baseline",gap:6,padding:"6px 16px",borderRadius:20,background:"var(--bg2)",border:"1px solid var(--bdr)"}}><span style={{fontSize:14,fontWeight:700,color:"var(--tx2)"}}>{totalPeople}</span><span style={{fontSize:11,fontWeight:600,color:"var(--tx2)",textTransform:"uppercase",letterSpacing:.5}}>people</span></div>
</div>
:<div style={{display:"flex",gap:8}}>{whoEmoji.map(function(e,i){return <span key={i} style={{fontSize:40}}>{e}</span>;})}</div>}
</div>
{/* Greeting */}
<div style={{fontSize:26,fontWeight:700,color:"var(--tx1)",textAlign:"center",lineHeight:"1.3"}}>{greeting}</div>
<div style={{fontSize:18,color:"var(--tx2)",textAlign:"center",marginTop:8}}>{totalPeople===1?"what kind of "+mctx.label.toLowerCase()+" are you feeling?":totalPeople===2?"what kind of "+mctx.label.toLowerCase()+" are you two feeling?":"what kind of "+mctx.label.toLowerCase()+" are we feeling?"}</div>


    {/* Two big option cards */}
    <div style={{width:"100%",display:"flex",flexDirection:"column",gap:16,marginTop:40}}>
      <button className="jfl-cta" style={{padding:"28px 16px",borderRadius:14}} onClick={function(){setMode("quiz");}}>
        <span style={{fontSize:34,marginBottom:8}}>🎲</span>
        <span style={{fontSize:19,fontWeight:700}}>Help {isSolo?"me":"us"} decide</span>
        <span style={{fontSize:15,opacity:.7,marginTop:4}}>{isSolo?"Answer a few quick questions":"Answer a few questions together"}</span>
      </button>
      <button className="jfl-btn" style={{padding:"28px 16px",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center"}} onClick={function(){setMode("direct");}}>
        <span style={{fontSize:34,marginBottom:8}}>🧠</span>
        <span style={{fontSize:19,fontWeight:700,color:"var(--tx1)"}}>{isSolo?"I already know":"We already know"}</span>
        <span style={{fontSize:15,color:"var(--tx2)",marginTop:4}}>Pick a mood directly</span>
      </button>
    </div>
  </div>
</div>;


}

/* ═══ DIRECT MOOD PICKER ═══ */
if(mode==="direct"){
var pickedMood=sel.mood?MOODS.find(function(m){return m.id===sel.mood;}):null;
if(pickedMood&&directConfirm){
return <div className="fade">
<div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px"}}>
<div style={{textAlign:"center",width:"100%",maxWidth:340}}>
<div className="pop" style={{width:90,height:90,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg1)",border:"2px solid "+pickedMood.c,boxShadow:"0 0 30px "+pickedMood.c+"33",margin:"0 auto"}}>
<span style={{fontSize:44}}>{pickedMood.emoji}</span>
</div>
<div className="pop" style={{fontSize:24,fontWeight:700,color:pickedMood.c,marginTop:16,animationDelay:".1s"}}>{pickedMood.label}</div>
<div className="pop" style={{fontSize:14,color:"var(--tx2)",marginTop:8,animationDelay:".2s"}}>{REVEAL[pickedMood.id]||pickedMood.desc}</div>
<div style={{display:"flex",flexDirection:"column",gap:10,marginTop:32,width:"100%"}}>
<button className="jfl-cta" style={{padding:18}} onClick={function(){setPhase("narrow");setP2count(0);setDirectConfirm(false);setMode("quiz");setDisagrees(0);setRound(0);pickQuestions(usedRef.current,"narrow");}}>
<span style={{fontSize:17,fontWeight:700}}>{"Let\u2019s narrow it down"}</span>
<span style={{fontSize:13,opacity:.7,marginTop:4}}>Answer a few questions to find the spot</span>
</button>
<button className="jfl-btn" style={{padding:14,fontSize:14}} onClick={function(){setDirectConfirm(false);setDismiss(true);}}>
<span style={{fontWeight:600,color:"var(--tx2)"}}>{isSolo?"I already know what I want":"We already know what we want"}</span>
</button>
<button style={{background:"none",border:"none",color:"var(--ac)",fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:"6px 0",marginTop:2}} onClick={function(){setDirectConfirm(false);}}>{"← Change mood"}</button>
</div>
</div>
</div>
</div>;
}
if(dismiss){
return <div className="fade">
<div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px"}}>
<div style={{textAlign:"center",maxWidth:300}}>
<span style={{fontSize:64}}>{"🤨"}</span>
<div style={{fontSize:20,fontWeight:700,color:"var(--tx1)",marginTop:16}}>{isSolo?"Then\u2026 why are you on here?":"Then\u2026 why are you all on here?"}</div>
<div style={{fontSize:14,color:"var(--tx2)",marginTop:10,lineHeight:"1.5"}}>{isSolo?"Seriously. Go order it. We\u2019ll be here when you inevitably can\u2019t decide next time.":"Seriously. Go order it. We\u2019ll be here when you inevitably can\u2019t decide next time."}</div>
<div style={{display:"flex",flexDirection:"column",gap:10,marginTop:32}}>
<button className="jfl-cta" style={{padding:16}} onClick={function(){go("dashboard");}}>
<span style={{fontSize:15,fontWeight:700}}>{isSolo?"Fine, take me back":"Fine, take us back"}</span>
</button>
<button className="jfl-btn" style={{padding:12,fontSize:13}} onClick={function(){setDismiss(false);setDirectConfirm(true);}}>
<span style={{fontWeight:600,color:"var(--tx2)"}}>{isSolo?"Wait no, actually help me decide":"Wait no, actually help us decide"}</span>
</button>
</div>
</div>
</div>
</div>;
}
return <div className="fade">
<TopBar title={isSolo?"Pick your mood":"Pick the mood"}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
<div style={{padding:"20px 16px",display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
<div style={{fontSize:13,color:"var(--tx2)",marginBottom:14}}>Pick what feels right. This shapes which restaurants surface.</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
{MOODS.map(function(m){var on=sel.mood===m.id;var hex=m.c;var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return <button key={m.id} onClick={function(){up("mood",m.id);}} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 8px 14px",borderRadius:12,border:on?"2px solid "+m.c:"1px solid var(--bdr)",background:on?"rgba("+r+","+g+","+b+",.08)":"var(--bg1)",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",boxShadow:on?"0 0 12px rgba("+r+","+g+","+b+",.15)":"none"}}>
<span style={{fontSize:24}}>{m.emoji}</span>
<span style={{fontSize:12,fontWeight:700,color:on?m.c:"var(--tx1)",textAlign:"center",lineHeight:"1.2",marginTop:8}}>{m.label}</span>
<div style={{width:20,height:1,background:on?m.c:"var(--bdr)",marginTop:6,marginBottom:6,borderRadius:1,opacity:.5}}></div>
<span style={{fontSize:11,color:on?"var(--tx1)":"var(--tx2)",textAlign:"center",lineHeight:"1.35",fontWeight:400}}>{fmtDesc(m.desc)}</span>
</button>;})}
</div>
<div style={{marginTop:"auto",paddingTop:20,paddingBottom:70}}><button className="jfl-cta" onClick={function(){setDirectConfirm(true);}} disabled={!sel.mood} aria-disabled={!sel.mood} style={{opacity:sel.mood?1:.3,transition:"opacity .3s"}}>{"Lock it in"}</button></div>
</div>
</div>;
}

if(!qs)return null;
if(qs.length===0){resolve();return null;}

/* ═══ HEAD-TO-HEAD MODE ═══ */
if(h2h){
var hq=h2h.qs[h2h.qi];
var allVoted=hq&&voters.every(function(v){return h2h.votes[v.id+"_"+h2h.qi]!==undefined;});


function h2hVote(voterId,yes){
  setH2H(function(prev){
    var voteKey=voterId+"_"+prev.qi;
    var oldVote=prev.votes[voteKey];
    var nv=Object.assign({},prev.votes);
    nv[voteKey]=yes;
    var np=Object.assign({},prev.perPerson);
    var curQ=prev.qs[prev.qi];
    if(!np[voterId])np[voterId]={};
    /* undo old vote weights if changing answer */
    if(oldVote!==undefined){
      var ow=oldVote?curQ.y:curQ.n;
      Object.keys(ow).forEach(function(k){np[voterId][k]=(np[voterId][k]||0)-ow[k];});
    }
    /* apply new vote weights */
    if(yes!==null){
      var w=yes?curQ.y:curQ.n;
      Object.keys(w).forEach(function(k){np[voterId][k]=(np[voterId][k]||0)+w[k];});
    }
    var wasAllVoted=voters.every(function(v){return prev.votes[v.id+"_"+prev.qi]!==undefined;});
    var nowAllVoted=voters.every(function(v){return nv[v.id+"_"+prev.qi]!==undefined;});
    return Object.assign({},prev,{votes:nv,perPerson:np});
  });
}

function resolveH2H(perPerson){
  /* Each person's top mood */
  var personMoods={};
  voters.forEach(function(v){
    var scores=perPerson[v.id]||{};
    var best=null,bestS=0;
    Object.keys(scores).forEach(function(k){if(scores[k]>bestS){bestS=scores[k];best=k;}});
    personMoods[v.id]=best||"b";
  });
  /* Count votes per mood */
  var moodVotes={};
  voters.forEach(function(v){
    var m=personMoods[v.id];
    if(!moodVotes[m])moodVotes[m]={count:0,females:0,people:[]};
    moodVotes[m].count++;
    moodVotes[m].people.push(v);
    if(FEMALE_IDS.indexOf(v.id)>=0)moodVotes[m].females++;
  });
  /* Find winner */
  var sorted=Object.keys(moodVotes).sort(function(a,b){
    if(moodVotes[b].count!==moodVotes[a].count)return moodVotes[b].count-moodVotes[a].count;
    if(props.h2hFemale&&moodVotes[b].females!==moodVotes[a].females)return moodVotes[b].females-moodVotes[a].females;
    return Math.random()-.5;
  });
  var winner=sorted[0];
  var moodId=QUIZ_MAP[winner]||"balanced";
  var mood=MOODS.find(function(m){return m.id===moodId;});
  if(!mood)mood={id:"balanced",emoji:"\u2696\uFE0F",label:"Balanced",desc:"A little of everything",c:"#4A9EFF"};
  var tiedTop=sorted.filter(function(s){return moodVotes[s].count===moodVotes[sorted[0]].count;});
  var method=tiedTop.length>1?(props.h2hFemale&&moodVotes[winner].females>0?(moodVotes[winner].females>1?"the women, as it should be \uD83D\uDC85":"the woman, as it should be \uD83D\uDC85"):"Coin flip"):"Majority";
  up("mood",moodId);
  if(phase==="narrow"){
    setH2H(null);
    setResolved({id:moodId,emoji:mood.emoji,label:mood.label,desc:mood.desc,c:mood.c,method:method,personMoods:personMoods,moodVotes:moodVotes,narrowH2H:true});
  }else{
    setResolved({id:moodId,emoji:mood.emoji,label:mood.label,desc:mood.desc,c:mood.c,method:method,personMoods:personMoods,moodVotes:moodVotes});
  }
}

/* ═══ H2H INTRO SPLASH ═══ */
if(h2hIntro){
  var isNarrowH2H=phase==="narrow";
  return <div className="fade">
    <div style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",background:"var(--bg0)"}}>
      <TopBar title={"\u2694\uFE0F Head to Head"} sub={isNarrowH2H?"Tiebreaker round":"Settling the score"} back={function(){setH2hIntro(false);setH2H(null);setDisagrees(0);setRound(0);}}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 24px",position:"relative"}}>
        {/* Glow */}
        <div style={{position:"absolute",width:220,height:220,borderRadius:"50%",background:isNarrowH2H?"linear-gradient(135deg,#F472B6,#C4956A)":"linear-gradient(135deg,#4A9EFF,#F472B6)",opacity:.1,filter:"blur(70px)",top:"15%",pointerEvents:"none"}}></div>
        {/* Animated swords */}
        <div className="tada" style={{fontSize:72,marginBottom:16}}>{"\u2694\uFE0F"}</div>
        {/* Phase-specific messaging */}
        {!isNarrowH2H&&<div>
          <div className="pop" style={{fontSize:24,fontWeight:800,color:"var(--tx1)",textAlign:"center",animationDelay:".1s"}}>{"Can\u2019t agree on a vibe?"}</div>
          <div className="pop" style={{fontSize:14,color:"var(--tx2)",marginTop:10,textAlign:"center",lineHeight:"1.5",animationDelay:".2s"}}>{"Time to settle it. Each person votes \u2014 one question at a time."}</div>
        </div>}
        {isNarrowH2H&&<div>
          <div className="pop" style={{fontSize:24,fontWeight:800,color:"var(--tx1)",textAlign:"center",animationDelay:".1s"}}>{"Still can\u2019t decide?"}</div>
          <div className="pop" style={{fontSize:14,color:"var(--tx2)",marginTop:10,textAlign:"center",lineHeight:"1.5",animationDelay:".2s"}}>{"Let\u2019s break this deadlock. Individual votes, winner takes all."}</div>
        </div>}
        {/* Voter preview */}
        <div className="pop" style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:12,marginTop:24,animationDelay:".35s"}}>
          {voters.map(function(v){return <div key={v.id} style={{textAlign:"center"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"var(--bg2)",border:"2px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{v.emoji}</div>
            <div style={{fontSize:10,color:"var(--tx3)",marginTop:4,fontWeight:600}}>{v.name}</div>
          </div>;})}
        </div>
        <div className="pop" style={{textAlign:"center",marginTop:18,animationDelay:".45s"}}>
          <div style={{fontSize:12,color:"var(--tx2)",fontWeight:600}}>{h2h.qs.length+" questions"}</div>
          <div style={{fontSize:12,color:"var(--tx2)",fontWeight:600,marginTop:2}}>{"everyone votes"}</div>
          <div style={{fontSize:12,color:"var(--ac)",fontWeight:700,marginTop:2}}>{"gloves off"}</div>
        </div>
      </div>
      {/* CTA */}
      <div style={{padding:"20px 24px 40px"}}>
        <button className="jfl-cta" onClick={function(){setH2hIntro(false);}} style={{padding:16,fontSize:17,fontWeight:700,width:"100%"}}>{"\u2694\uFE0F Let\u2019s settle this"}</button>
        <button style={{width:"100%",padding:8,fontSize:12,fontWeight:500,marginTop:8,background:"none",border:"1px solid var(--bdr)",borderRadius:20,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit",opacity:.5}} onClick={function(){setH2hIntro(false);setH2H(null);setDisagrees(0);setRound(0);}}>{"Nevermind, go back"}</button>
      </div>
    </div>
  </div>;
}

if(!hq)return null;
return <div className="fade">
  <TopBar title={"\u2694\uFE0F Head to Head"} sub={"Question "+(h2h.qi+1)+" of "+h2h.qs.length} back={function(){setH2hIntro(false);setH2H(null);setDisagrees(0);setRound(0);}}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
  <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <span style={{fontSize:36}}>{hq.e}</span>
      <div style={{fontSize:16,fontWeight:700,color:"var(--tx1)",marginTop:10,lineHeight:"1.4"}}>{fmtQ(hq.q)}</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {voters.map(function(v){
        var voteKey=v.id+"_"+h2h.qi;
        var vote=h2h.votes[voteKey];
        var voted=vote!==undefined;
        return <div key={v.id} className="jfl-card" style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{v.emoji}</span>
            <span style={{fontSize:14,fontWeight:700,color:"var(--tx1)",flex:1}}>{v.name}</span>
          </div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button className="jfl-btn" style={{flex:1,padding:10,fontSize:13,fontWeight:700,background:vote===true?"var(--ac)":"",color:vote===true?"#fff":"",borderColor:vote===true?"var(--ac)":""}} onClick={function(){h2hVote(v.id,true);}}>Yes</button>
            <button className="jfl-btn" style={{flex:1,padding:10,fontSize:13,fontWeight:700,background:vote===false?"var(--tx2)":"",color:vote===false?"#fff":"",borderColor:vote===false?"var(--tx2)":""}} onClick={function(){h2hVote(v.id,false);}}>No</button>
            <button className="jfl-btn" style={{flex:1,padding:10,fontSize:13,fontWeight:700,background:vote===null&&voted?"var(--tx3)":"",color:vote===null&&voted?"#fff":"",borderColor:vote===null&&voted?"var(--tx3)":""}} onClick={function(){h2hVote(v.id,null);}}>idk</button>
          </div>
        </div>;
      })}
    </div>
    <div style={{marginTop:20}}>
      <button className="jfl-cta" disabled={!allVoted} aria-disabled={!allVoted} style={{padding:14,fontSize:15,fontWeight:700,width:"100%",opacity:allVoted?1:.3,transition:"opacity .3s"}} onClick={function(){if(h2h.qi+1>=h2h.qs.length){resolveH2H(h2h.perPerson);}else{setH2H(function(p){return Object.assign({},p,{qi:p.qi+1});});}}}>{h2h.qi+1>=h2h.qs.length?"See results \u2192":"Next question \u2192"}</button>
    </div>
  </div>
</div>;


}

var answeredThisRound=0;
qs.forEach(function(q,i){var key=(phase==="narrow"?"n":"r")+round+"q"+i;if(ans["_"+key])answeredThisRound++;});

return <div className="fade">
<TopBar title={phase==="narrow"?"Narrowing it down":"Quick vibe check"} sub={sel.qrLabel?(sel.qrEmoji+" "+sel.qrLabel):(phase==="narrow"?"Almost there":"")}  onTheme={props.onTheme} theme={props.theme} onInfo={props.onInfo} onLogo={props.onLogo}/>
<div style={{padding:"20px 16px",display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
{phase==="narrow"&&sel.mood&&(function(){var m=MOODS.find(function(mm){return mm.id===sel.mood;});return m?<div style={{marginBottom:14}}>
<div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:20,background:"rgba(244,114,182,.06)",border:"1px solid rgba(244,114,182,.15)"}}>
<span style={{fontSize:16}}>{m.emoji}</span>
<span style={{fontSize:11,fontWeight:600,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:.5}}>Mood locked</span>
<span style={{fontSize:13,fontWeight:700,color:"var(--ac)"}}>{m.label}</span>
</div></div>:null;})()}
<div style={{fontSize:14,color:"var(--tx2)",marginBottom:16}}>{phase==="narrow"?"Now let\u2019s figure out exactly where to eat.":(isSolo?"Answer honestly. No wrong answers.":isDuo?"Answer together. No wrong answers.":"Everyone weigh in. No wrong answers.")}</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
{qs.map(function(q,i){
var key=(phase==="narrow"?"n":"r")+round+"q"+i;
var a=ans["*"+key];
var pending=pend[i];
var showButtons=!a;
return <div key={key} className={"jfl-card stagger-"+(i+1)} style={{padding:16,transition:"opacity .3s"}}>
<div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
<span style={{fontSize:30}}>{q.e}</span>
<div style={{flex:1}}>
<div style={{fontSize:15,fontWeight:600,color:"var(--tx1)",lineHeight:"1.4"}}>{fmtQ(q.q)}</div>
{showButtons&&<div style={{display:"flex",gap:8,marginTop:12}}>
<button className="jfl-btn" style={{flex:1,padding:12,fontSize:15,fontWeight:700,background:pending==="y"?"rgba(244,114,182,.15)":"",border:pending==="y"?"1px solid var(--ac)":"1px solid var(--bdr)",color:pending==="y"?"var(--ac)":"var(--tx1)"}} onClick={function(){setPend(function(p){var n=Object.assign({},p);n[i]="y";return n;});}}>Yes</button>
<button className="jfl-btn" style={{flex:1,padding:12,fontSize:15,fontWeight:700,background:pending==="n"?"rgba(244,114,182,.15)":"",border:pending==="n"?"1px solid var(--ac)":"1px solid var(--bdr)",color:pending==="n"?"var(--ac)":"var(--tx1)"}} onClick={function(){setPend(function(p){var n=Object.assign({},p);n[i]="n";return n;});}}>No</button>
<button className="jfl-btn" style={{flex:1,padding:12,fontSize:15,fontWeight:700,background:pending==="s"?"rgba(244,114,182,.15)":"",border:pending==="s"?"1px solid var(--ac)":"1px solid var(--bdr)",color:pending==="s"?"var(--ac)":"var(--tx1)"}} onClick={function(){setPend(function(p){var n=Object.assign({},p);n[i]="s";return n;});}}>{isSolo?"idk":"Can\u2019t agree"}</button>
</div>}
{a&&<div style={{fontSize:12,fontWeight:600,color:"var(--ac)",marginTop:8}}>{a==="y"?"Yes \u2713":a==="n"?"No \u2713":a==="s"?"Skipped":"answered"}</div>}
</div>
</div>
</div>;
})}
</div>
{/* Submit button - always visible, lights up when ready */}
{(function(){var allPending=pend[0]&&pend[1]&&pend[2];var anyUnanswered=qs.some(function(q,i){var key="*"+(phase==="narrow"?"n":"r")+round+"q"+i;return!ans[key];});var ready=allPending&&anyUnanswered;return <div style={{marginTop:16}}>
<button className="jfl-cta" style={{padding:14,fontSize:16,fontWeight:700,width:"100%",opacity:ready?1:.3,pointerEvents:ready?"auto":"none",transition:"opacity .3s"}} onClick={function(){
var newAns=Object.assign({},ans);
var newDisagrees=disagrees;
for(var i=0;i<3;i++){
var p=pend[i];
var yes=p==="y"?true:p==="n"?false:null;
var key="_"+(phase==="narrow"?"n":"r")+round+"q"+i;
newAns[key]=p;
if(yes===null&&!isSolo){newDisagrees++;}
if(yes!==null){
var q=qs[i];
var weights=yes?q.y:q.n;
Object.keys(weights).forEach(function(k){newAns[k]=(newAns[k]||0)+weights[k];});
if(yes&&q.ct){newAns._ct=newAns._ct||{};newAns._ct[q.ct]=(newAns._ct[q.ct]||0)+1;}
}
}
setAns(newAns);
setDisagrees(newDisagrees);
setPend({});
/* Check for H2H trigger */
if(newDisagrees>=2&&voters.length>=2){
var tags2=getQuizTags();var meal2=mctx.meal;
var avail2=QUIZ_QS.filter(function(q2,idx){if(used.indexOf(idx)>=0)return false;if(!q2.w.some(function(t){return tags2.indexOf(t)>=0;}))return false;if(q2.m!=="all"){var meals2=q2.m.split(",");if(meals2.indexOf(meal2)<0)return false;}return true;});
var h2hQs2=avail2.sort(function(){return Math.random()-.5;}).slice(0,5);
if(h2hQs2.length===0){resolve();return;}
setH2H({qs:h2hQs2,qi:0,votes:{},perPerson:{}});
setH2hIntro(true);
return;
}
/* Phase 2: resolve after each batch */
if(phase==="narrow"){
if(newAns._ct){var topCt=null,topCtS=0;Object.keys(newAns._ct).forEach(function(k){if(newAns._ct[k]>topCtS){topCtS=newAns._ct[k];topCt=k;}});if(topCt)up("ct",topCt);}
resolve();
return;
}
/* Phase 1: check if mood can be determined */
var totalAnswered=0;
Object.keys(newAns).forEach(function(k){if(k.charAt(0)==="_")totalAnswered++;});
if(totalAnswered>=3){
var best=null,bestScore=0,second=0;
Object.keys(newAns).forEach(function(k){if(k.charAt(0)==="*")return;if(newAns[k]>bestScore){second=bestScore;bestScore=newAns[k];best=k;}else if(newAns[k]>second)second=newAns[k];});
var gap=bestScore-second;
if((gap>=4&&totalAnswered>=3)||(gap>=2&&totalAnswered>=6)||(totalAnswered>=9)){
var moodId=QUIZ_MAP[best]||"balanced";
var mood=MOODS.find(function(m){return m.id===moodId;})||MOODS.find(function(m){return m.id==="balanced";});
up("mood",moodId);
if(newAns._ct){var topCt2=null,topCtS2=0;Object.keys(newAns._ct).forEach(function(k){if(newAns._ct[k]>topCtS2){topCtS2=newAns._ct[k];topCt2=k;}});if(topCt2)up("ct",topCt2);}
setResolved(mood||{id:"balanced",emoji:"\u2696\uFE0F",label:"Balanced",desc:"A little of everything",c:"#4A9EFF"});
return;
}
}
/* Not resolved yet - load next round */
if(round<2){setRound(round+1);pickQuestions(usedRef.current);}
}}>{"Keep going \u2192"}</button>
</div>;})()}
</div>

  </div>;
}

function FT(props){var sel=props.sel,up=props.up;var _o=useState(false);var open=_o[0],setO=_o[1];
return <div style={{marginTop:16}}>
<button onClick={function(){setO(!open);}} style={{background:"none",border:"none",color:"var(--ac)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",padding:"8px 0"}}>{open?"Hide options":"Adjust budget, speed, more…"}</button>
{open&&<div className="fade" style={{marginTop:8}}>
<Rw label="Budget">{[{id:"cheap",l:"Cheap"},{id:"normal",l:"Normal"},{id:"flexible",l:"Flexible"},{id:"feast",l:"Feast"}].map(function(b){return <MC key={b.id} on={sel.budget===b.id} onClick={function(){up("budget",b.id);}}>{b.l}</MC>;})}</Rw>
<Rw label="Speed">{[{id:"fast",l:"ASAP"},{id:"normal",l:"Normal"}].map(function(b){return <MC key={b.id} on={sel.speed===b.id} onClick={function(){up("speed",b.id);}}>{b.l}</MC>;})}</Rw>
<Rw label="Familiarity">{[{id:"safe",l:"Safest"},{id:"familiar",l:"Familiar"},{id:"surprise",l:"Surprise"}].map(function(b){return <MC key={b.id} on={sel.fam===b.id} onClick={function(){up("fam",b.id);}}>{b.l}</MC>;})}</Rw>
<div style={{marginTop:8}}><Tg label="Avoid repeats" v={sel.ar} set={function(v){up("ar",v);}}/><Tg label="Kid-friendly required" v={sel.kf} set={function(v){up("kf",v);}}/><Tg label="Leftovers matter" v={sel.lo} set={function(v){up("lo",v);}}/></div>
</div>}

  </div>;
}
function Rw(props){return <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:8}}>{props.label}</div><div style={{display:"flex",gap:6}}>{props.children}</div></div>;}
function MC(props){return <button className={props.on?"jfl-mc on":"jfl-mc"} onClick={props.onClick}>{props.children}</button>;}
function Tg(props){return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--bdr)"}}><span style={{fontSize:13,fontWeight:500,color:"var(--tx2)"}}>{props.label}</span><div onClick={function(){props.set(!props.v);}} style={{width:42,height:22,borderRadius:11,background:props.v?"var(--ac)":"var(--bdr)",position:"relative",cursor:"pointer",transition:"background .2s"}}><div style={{width:16,height:16,borderRadius:8,background:"white",position:"absolute",top:3,left:props.v?23:3,transition:"left .2s",boxShadow:"0 1px 2px rgba(0,0,0,.15)"}}></div></div></div>;}

function SettingsPanel(props){
var go=props.go,rests=props.rests,setR=props.setR,ppl=props.ppl,setPpl=props.setPpl,setSel=props.setSel,groups=props.groups,setGroups=props.setGroups,qrCustom=props.qrCustom,setQR=props.setQR;
var _pg=useState("menu");var page=_pg[0],setPage=_pg[1];
var _sel=useState(null);var selId=_sel[0],setSelId=_sel[1];
var _selP=useState(null);var selPId=_selP[0],setSelPId=_selP[1];
var _selG=useState(null);var selGId=_selG[0],setSelGId=_selG[1];
var _selQR=useState(null);var selQRIdx=_selQR[0],setSelQRIdx=_selQR[1];
var _fs=useState(0);var factoryStep=_fs[0],setFactoryStep=_fs[1];
var _inStep=useState(0);var inStep=_inStep[0],setInStep=_inStep[1];
var _obvEdit=useState(null);var obvEditIdx=_obvEdit[0],setObvEditIdx=_obvEdit[1];
var _rsort=useState("name");var restSort=_rsort[0],setRestSort=_rsort[1];
var _emIn=useState("");var emIn=_emIn[0],setEmIn=_emIn[1];

var selR=selId?rests.find(function(r){return r.id===selId;}):null;
var selP=selPId?ppl.find(function(p){return p.id===selPId;}):null;
var selG=selGId?groups.find(function(g){return g.id===selGId;}):null;
var qrList=(qrCustom&&qrCustom.length>0)?qrCustom:QR_DEFAULTS;
var selQR=selQRIdx!==null?qrList[selQRIdx]:null;

var _upl=useState("idle");var uplStatus=_upl[0],setUplStatus=_upl[1];
var _uplMsg=useState("");var uplMsg=_uplMsg[0],setUplMsg=_uplMsg[1];
var _am=useState(false),showAddMod=_am[0],setShowAddMod=_am[1];var _at=useState("rid"),aType=_at[0],setAType=_at[1];var _ar=useState(""),aTarget=_ar[0],setATarget=_ar[1];var _aw=useState(5),aWeight=_aw[0],setAWeight=_aw[1];var _al=useState(""),aLabel=_al[0],setALabel=_al[1];var _as2=useState(false),aSolo=_as2[0],setASolo=_as2[1];
var _cm=useState(false),showAddCtx=_cm[0],setShowAddCtx=_cm[1];var _cw2=useState("always"),cxWhen=_cw2[0],setCxWhen=_cw2[1];var _cw3=useState(5),cxW=_cw3[0],setCxW=_cw3[1];var _cl2=useState(""),cxLabel=_cl2[0],setCxLabel=_cl2[1];

function handleUpload(e){
var file=e.target.files&&e.target.files[0];
if(!file)return;
setUplStatus("parsing");setUplMsg("Reading file…");
var reader=new FileReader();
reader.onload=function(ev){
try{
var text=ev.target.result;
var result=Papa.parse(text,{header:true,skipEmptyLines:true});
if(!result.data||result.data.length===0){setUplStatus("error");setUplMsg("No data found.");return;}
var cols=Object.keys(result.data[0]||{});
var storeCol=cols.find(function(c){return/store.?name/i.test(c);});
var dateCol=cols.find(function(c){return/created.?at|order.?date|date/i.test(c);});
if(!storeCol){setUplStatus("error");setUplMsg("No STORE_NAME column found. Columns: "+cols.join(", "));return;}
var agg={};
var subtotalCol=cols.find(function(c){return/subtotal/i.test(c);});
var itemCol=cols.find(function(c){return/^item$/i.test(c);});
var orderItems={};
result.data.forEach(function(row){
var name=(row[storeCol]||"").trim();
if(!name)return;
if(!agg[name])agg[name]={count:0,lastDate:null,firstDate:null,dates:[]};
agg[name].count++;
if(dateCol&&row[dateCol]){
var d=new Date(row[dateCol]);
if(!isNaN(d.getTime())){if(!agg[name].lastDate||d>agg[name].lastDate)agg[name].lastDate=d;if(!agg[name].firstDate||d<agg[name].firstDate)agg[name].firstDate=d;agg[name].dates.push(d);}
if(subtotalCol&&row[dateCol]){
var ts=(row[dateCol]||"").slice(0,19);
var key=name+"|"+ts;
if(!orderItems[key])orderItems[key]={store:name,total:0,items:[]};
orderItems[key].total+=parseFloat(row[subtotalCol])||0;
if(itemCol)orderItems[key].items.push({name:row[itemCol]||"",price:parseFloat(row[subtotalCol])||0});
}
}
});
/* Infer party size per order */
function inferParty(order){
var mains=0,kidMains=0;
order.items.forEach(function(item){
var nm=item.name.toLowerCase();
if(/sauce|packet|napkin|utensil/i.test(nm))return;
if(/kid|happy meal/i.test(nm)){kidMains++;return;}
if(item.price>=7)mains++;
});
var t=order.total;
if(kidMains>0)return(mains+kidMains>=5||t>60)?"group":"family";
if(mains<=1&&t<25)return"solo";
if(mains<=2&&t<45)return"couple";
if(mains<=4&&t<70)return"family";
return"group";
}
var storePartyAvgs={};
Object.values(orderItems).forEach(function(o){
var party=inferParty(o);
var food=o.total;var svc=food*.10;var tip=food<15?3:food>=100?10:5;
var est=Math.ceil((food+svc+tip)/5)*5;
if(!storePartyAvgs[o.store])storePartyAvgs[o.store]={solo:{s:0,n:0},couple:{s:0,n:0},family:{s:0,n:0},group:{s:0,n:0}};
storePartyAvgs[o.store][party].s+=est;
storePartyAvgs[o.store][party].n++;
});
var now=new Date();
var matched=0,unmatched=[];
var restNames=rests.map(function(r){return{id:r.id,lower:r.name.toLowerCase()};});
Object.keys(agg).forEach(function(storeName){
var lower=storeName.toLowerCase();
var match=restNames.find(function(rn){return lower.indexOf(rn.lower)>=0||rn.lower.indexOf(lower)>=0;});
if(match){
matched++;
var info=agg[storeName];
var daysSince=info.lastDate?Math.max(0,Math.round((now-info.lastDate)/(1000*60*60*24))):999;
var lastDateStr=info.lastDate?info.lastDate.toISOString().slice(0,10):null;
var upd={to:info.count,lo:daysSince,ld:lastDateStr};
var firstDateStr=info.firstDate?info.firstDate.toISOString().slice(0,10):null;
if(firstDateStr)upd.fd=firstDateStr;
var now90=new Date(now.getTime()-90*86400000),now365=new Date(now.getTime()-365*86400000);
var orderDates=info.dates||[];var seen90={},seen365={},c90=0,c365=0;
orderDates.forEach(function(d){var dk=d.toISOString().slice(0,19);if(!seen90[dk]&&d>=now90){seen90[dk]=1;c90++;}if(!seen365[dk]&&d>=now365){seen365[dk]=1;c365++;}});
upd.to90=c90;upd.to365=c365;
var pa=storePartyAvgs[storeName];
if(pa){
if(pa.solo.n>0)upd.acS=Math.ceil(pa.solo.s/pa.solo.n/5)*5;
if(pa.couple.n>0)upd.acC=Math.ceil(pa.couple.s/pa.couple.n/5)*5;
if(pa.family.n>0)upd.acF=Math.ceil(pa.family.s/pa.family.n/5)*5;
if(pa.group.n>0)upd.acG=Math.ceil(pa.group.s/pa.group.n/5)*5;
}
setR(function(rs){return rs.map(function(r){
if(r.id===match.id)return Object.assign({},r,upd);
return r;
});});
}else{
unmatched.push(storeName);
}
});
props.setDR(now.toISOString().slice(0,10));
var totalOrders=0;Object.keys(agg).forEach(function(k){totalOrders+=agg[k].count;});
var msg=totalOrders+" orders · "+Object.keys(agg).length+" restaurants · "+matched+" matched";
if(unmatched.length>0)msg+="· "+unmatched.length+" unmatched";
setUplStatus("done");setUplMsg(msg);
}catch(err){
setUplStatus("error");setUplMsg("Couldn\u2019t parse that file. Make sure it\u2019s a valid DoorDash CSV export.");
}
};
reader.onerror=function(){setUplStatus("error");setUplMsg("Could not read the file. Please try again.");};
reader.readAsText(file);
e.target.value="";
}

function Sheet(p){return <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,height:"100dvh",overflow:"auto",background:"var(--bg0)",zIndex:100,display:"flex",flexDirection:"column"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>{p.icon&&<span style={{fontSize:24}}>{p.icon}</span>}<span style={{fontSize:16,fontWeight:700,color:"var(--tx1)"}}>{p.title}</span></div>
<button onClick={p.onClose} style={{background:"none",border:"none",color:"var(--tx2)",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Done</button>
</div>
<div style={{flex:1,padding:"16px",overflow:"auto"}}>
{p.children}
</div>

  </div>;}

function EmojiEdit(p){return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
<input type="text" aria-label="Edit emoji" value={emIn||p.val} onChange={function(e){setEmIn(e.target.value);p.onChange(e.target.value);}} onFocus={function(){setEmIn(p.val);}} onBlur={function(){setEmIn("");}} style={{width:40,padding:"4px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:20,textAlign:"center",fontFamily:"inherit"}}/>

  </div>;}

/* iOS-style menu row */
function MenuRow(p){return <button onClick={p.onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",background:"none",border:"none",borderBottom:"1px solid var(--bdr)",cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}>
<span style={{fontSize:20,width:28,textAlign:"center"}}>{p.icon}</span>
<div style={{flex:1}}>
<div style={{fontSize:14,fontWeight:600,color:"var(--tx1)"}}>{p.label}</div>
{p.sub&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{p.sub}</div>}
</div>
<span style={{fontSize:14,color:"var(--tx3)"}}>{"›"}</span>
</button>;}

/* Sub-page header */
function SubBar(p){return <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)"}}>
<div style={{display:"flex",alignItems:"center",gap:6,zIndex:1}}>
<button onClick={function(){setPage("menu");setSelId(null);setSelPId(null);setSelGId(null);setSelQRIdx(null);setObvEditIdx(null);}} aria-label="Go back" style={{background:"none",border:"none",color:"var(--tx2)",fontSize:18,cursor:"pointer",padding:"2px 4px 2px 0",fontFamily:"inherit"}}>{"←"}</button>
<div><div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div><div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div></div>
</div>
<div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",padding:"0 90px",fontSize:14,fontWeight:700,color:"var(--tx1)"}}>{p.title}</div>
<div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>{(function(){var _d=props.theme==="dark"||((!props.theme||props.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);var _ib=_d?{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)"}:{background:"rgba(0,0,0,.06)",border:"1px solid rgba(0,0,0,.08)"};var _ibs=Object.assign({},_ib,{borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34});return <>{props.onTheme&&<button onClick={props.onTheme} style={Object.assign({},_ibs,{opacity:.8})}>{_d?"🌙":"☀️"}</button>}{props.onInfo?<button onClick={props.onInfo} style={_ibs}>{"ℹ️"}</button>:<div style={{width:34}}></div>}</>;})()}</div>

  </div>;}

return(
<div className="fade" style={{height:"100dvh",overflow:"auto",display:"flex",flexDirection:"column",position:"relative"}}>


  {/* ═══ SHEETS (always available) ═══ */}
  {selR&&<Sheet icon={selR.emoji} title={selR.name} onClose={function(){setSelId(null);}}>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Name</div><input type="text" value={selR.name} onChange={function(e){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{name:e.target.value}):re;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:13,fontFamily:"inherit"}}/></div>
      <div><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Emoji</div><EmojiEdit val={selR.emoji} onChange={function(v){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{emoji:v}):re;});});}}/></div>
    </div>
    <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Notes</div><textarea value={selR.notes||""} onChange={function(e){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{notes:e.target.value}):re;});});}} rows={2} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/></div>
    <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginBottom:6}}>Restaurant profile</div>
    {[{k:"hs",l:"Healthy"},{k:"cs",l:"Comfort"},{k:"rs",l:"Reliable"}].map(function(s){var cur=Math.round((selR[s.k]||.5)*4)+1;if(cur<1)cur=1;if(cur>5)cur=5;return <div key={s.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:11,fontWeight:500,width:65,color:"var(--tx3)"}}>{s.l}</span><div style={{flex:1,display:"flex",gap:4}}>{[1,2,3,4,5].map(function(n){return <button key={n} onClick={function(){var v=(n-1)/4,key=s.k;setR(function(rs){return rs.map(function(re){if(re.id===selR.id){var o=Object.assign({},re);o[key]=v;return o;}return re;});});}} style={{flex:1,height:28,borderRadius:6,border:"1px solid "+(n<=cur?"var(--ac)":"var(--bdr)"),background:n<=cur?"rgba(244,114,182,.15)":"var(--bg1)",color:n<=cur?"var(--ac)":"var(--tx3)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>;})}</div></div>;})}
    <div style={{marginTop:12,marginBottom:12,display:"flex",flexDirection:"column",gap:10}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:6}}>Spicy</div>
        <div style={{display:"flex",gap:4}}>
          {[{v:0,l:"No"},{v:1,l:"Optional"},{v:2,l:"Yes"}].map(function(o){var cur=selR.spicy===true?2:selR.spicy==="optional"?1:selR.spicy===2?2:selR.spicy===1?1:0;var on=cur===o.v;return <button key={o.v} onClick={function(){var sv=o.v===2?true:o.v===1?"optional":false;setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{spicy:sv}):re;});});}} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>;})}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:6}}>Dessert level</div>
        <div style={{display:"flex",gap:4}}>
          {[{v:0,l:"None"},{v:1,l:"On the menu"},{v:2,l:"Primarily"}].map(function(o){var cur=selR.ts>=0.8?2:selR.ts>=0.4?1:0;var on=cur===o.v;return <button key={o.v} onClick={function(){var tv=o.v===2?0.95:o.v===1?0.5:0.15;setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{ts:tv}):re;});});}} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>;})}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:6}}>Kid-friendly</div>
        <div style={{display:"flex",gap:4}}>
          {[{v:false,l:"No"},{v:true,l:"Yes"}].map(function(o){var on=(selR.ks>=0.6)===o.v;return <button key={o.l} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{ks:o.v?0.85:0.25}):re;});});}} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>;})}
        </div>
      </div>
    </div>        <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginTop:12,marginBottom:6}}>Eligible meals</div>
    <div style={{fontSize:11,color:"var(--tx3)",marginBottom:8}}>Which meals can this restaurant serve?</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {[{id:"breakfast",l:"Breakfast"},{id:"brunch",l:"Brunch"},{id:"lunch",l:"Lunch"},{id:"dinner",l:"Dinner"},{id:"latenight",l:"Late Night"}].map(function(m){var mf=MEAL_FIT[selR.id]||{};var on=(mf[m.id]||0)>=0.15;return <button key={m.id} onClick={function(){var rid=selR.id,mid=m.id;var cur=MEAL_FIT[rid]||{};var nv=Object.assign({},cur);if((nv[mid]||0)>=0.15)nv[mid]=0;else nv[mid]=0.65;MEAL_FIT[rid]=nv;setR(function(rs){return rs.map(function(re){return re.id===rid?Object.assign({},re,{_mfv:(re._mfv||0)+1}):re;});});}} style={{padding:"5px 12px",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.l}</button>;})}
    </div>        <div style={{display:"flex",gap:8,marginTop:4,marginBottom:4}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Budget (1-4)</div><select value={selR.bl||2} onChange={function(e){var v=parseInt(e.target.value);setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{bl:v}):re;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}><option value={1}>$ Cheap</option><option value={2}>$$ Normal</option><option value={3}>$$$ Pricey</option><option value={4}>$$$$ Splurge</option></select></div>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Speed (1-2)</div><select value={selR.sl||2} onChange={function(e){var v=parseInt(e.target.value);setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{sl:v}):re;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}><option value={1}>Fast</option><option value={2}>Normal</option></select></div>
    </div>
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <button className="jfl-btn" style={{flex:1,fontSize:12}} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{fav:!re.fav}):re;});});}}>{selR.fav?"Unfavorite":"Favorite"}</button>
      <button className="jfl-btn" style={{flex:1,fontSize:12}} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{to:0,lo:30,streak:0}):re;});});}}>Reset</button>
    </div>
    <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginTop:16,marginBottom:8}}>Context rules</div>
    <div style={{fontSize:11,color:"var(--tx3)",marginBottom:8}}>Boosts or penalties based on who's eating, time of day, or mood</div>
    {(selR.ctx||[]).map(function(cx,ci){var whenLabels={always:"Always",kids:"When kids present",couple:"Couple (no kids)",solo:"Solo",group:"Group (4+)",female:"When women present",latenight:"Late night",breakfast:"Breakfast",brunch:"Brunch","mood-comfort":"Comfort mood","mood-trash-goblin":"Trash goblin mood","mood-healthy":"Healthy mood","mood-other":"Non-healthy mood"};return <div key={ci} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,padding:"6px 8px",borderRadius:6,background:cx.w>0?"rgba(74,158,255,.08)":"rgba(255,100,100,.08)",border:"1px solid "+(cx.w>0?"rgba(74,158,255,.2)":"rgba(255,100,100,.2)")}}>
      <span style={{fontSize:13,width:20,textAlign:"center"}}>{cx.w>0?"↑":"↓"}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:600,color:"var(--tx1)"}}>{cx.label}</div>
        <div style={{fontSize:10,color:"var(--tx2)"}}>{whenLabels[cx.when]||cx.when} · weight: {cx.w>0?"+":""}{cx.w}</div>
      </div>
      <button onClick={function(){if(confirm("Remove this context rule?")){var idx=ci;setR(function(rs){return rs.map(function(re){if(re.id!==selR.id)return re;var nc=(re.ctx||[]).filter(function(_,i){return i!==idx;});return Object.assign({},re,{ctx:nc});});});}}} style={{background:"none",border:"none",color:"var(--tx3)",cursor:"pointer",fontSize:14,padding:"2px 4px"}}>×</button>
    </div>;})}
    {!showAddCtx?<button className="jfl-btn" style={{fontSize:11,width:"100%",marginTop:4}} onClick={function(){setShowAddCtx(true);}}>+ Add context rule</button>:<div style={{marginTop:6,padding:10,borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg2)"}}>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <select value={cxWhen} onChange={function(e){setCxWhen(e.target.value);}} style={{flex:1,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit"}}><option value="always">Always</option><option value="kids">When kids present</option><option value="couple">Couple (no kids)</option><option value="solo">Solo</option><option value="group">Group (4+)</option><option value="female">When women present</option><option value="latenight">Late night</option><option value="breakfast">Breakfast</option><option value="brunch">Brunch</option><option value="mood-comfort">Comfort mood</option><option value="mood-trash-goblin">Trash goblin mood</option><option value="mood-healthy">Healthy mood</option><option value="mood-other">Non-healthy mood</option></select>
        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"var(--tx3)"}}>Wt</span><input type="number" value={cxW} onChange={function(e){setCxW(parseInt(e.target.value)||0);}} style={{width:48,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit",textAlign:"center"}}/></div>
      </div>
      <input type="text" placeholder="Label (e.g. Great for date night)" value={cxLabel} onChange={function(e){setCxLabel(e.target.value);}} style={{width:"100%",padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit",marginBottom:6,boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:6}}>
        <button className="jfl-btn" style={{flex:1,fontSize:11}} onClick={function(){if(!cxLabel)return;setR(function(rs){return rs.map(function(re){if(re.id!==selR.id)return re;return Object.assign({},re,{ctx:(re.ctx||[]).concat([{when:cxWhen,w:cxW,label:cxLabel}])});});});setShowAddCtx(false);setCxWhen("always");setCxW(5);setCxLabel("");}}>Save</button>
        <button className="jfl-btn" style={{flex:1,fontSize:11}} onClick={function(){setShowAddCtx(false);}}>Cancel</button>
      </div>
    </div>}
    {/* Inactive system */}
    {selR.bo?<div style={{marginTop:14,padding:12,borderRadius:10,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.2)"}}>
      <div style={{fontSize:12,fontWeight:700,color:"var(--red)",marginBottom:4}}>Inactive</div>
      <div style={{fontSize:12,color:"var(--tx2)",marginBottom:8}}>{selR.bo==="closed"?"This location is no longer operating.":selR.bo==="quality"?"Reason: Food quality issues":selR.bo==="accuracy"?"Reason: They mess up orders too much":selR.bo==="yucky"?"Reason: Just not good":selR.bo==="other"?"Reason: Other":"Paused"}</div>
      <button className="jfl-btn" style={{width:"100%",fontSize:12,color:"var(--grn)",borderColor:"var(--grn)"}} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{bo:false}):re;});});setInStep(0);}}>Reactivate</button>
    </div>
    :inStep===0?<button className="jfl-btn" style={{width:"100%",marginTop:14,fontSize:12,color:"var(--red)",borderColor:"var(--red)"}} onClick={function(){setInStep(1);}}>Mark Inactive</button>
    :inStep===1?<div style={{marginTop:14,padding:12,borderRadius:10,background:"var(--bg2)",border:"1px solid var(--bdr)"}}>
      <div style={{fontSize:12,fontWeight:700,color:"var(--tx1)",marginBottom:8}}>Is this location still operating?</div>
      <div style={{display:"flex",gap:8}}>
        <button className="jfl-btn" style={{flex:1,fontSize:12}} onClick={function(){setInStep(2);}}>Yes, still open</button>
        <button className="jfl-btn" style={{flex:1,fontSize:12,color:"var(--red)",borderColor:"var(--red)"}} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{bo:"closed"}):re;});});setInStep(0);}}>No, it closed</button>
      </div>
      <button style={{background:"none",border:"none",color:"var(--tx3)",fontSize:11,marginTop:8,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setInStep(0);}}>Cancel</button>
    </div>
    :inStep===2?<div style={{marginTop:14,padding:12,borderRadius:10,background:"var(--bg2)",border:"1px solid var(--bdr)"}}>
      <div style={{fontSize:12,fontWeight:700,color:"var(--tx1)",marginBottom:8}}>Why are you marking them inactive?</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[{id:"quality",l:"🤢 Food quality is bad"},{id:"accuracy",l:"❌ They mess up orders too much"},{id:"yucky",l:"😒 I just think they're yucky"},{id:"other",l:"🤷 Other reason"}].map(function(r){return <button key={r.id} className="jfl-btn" style={{fontSize:12,textAlign:"left"}} onClick={function(){setR(function(rs){return rs.map(function(re){return re.id===selR.id?Object.assign({},re,{bo:r.id}):re;});});setInStep(0);}}>{r.l}</button>;})}
      </div>
      <button style={{background:"none",border:"none",color:"var(--tx3)",fontSize:11,marginTop:8,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setInStep(1);}}>Back</button>
    </div>:null}
  </Sheet>}
  {selP&&<Sheet icon={selP.emoji} title={selP.name} onClose={function(){setSelPId(null);}}>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Name</div><input type="text" value={selP.name} onChange={function(e){setPpl(function(ps){return ps.map(function(pp){return pp.id===selP.id?Object.assign({},pp,{name:e.target.value}):pp;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:13,fontFamily:"inherit"}}/></div>
      <div><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Emoji</div><input type="text" value={selP.emoji} onChange={function(e){setPpl(function(ps){return ps.map(function(pp){return pp.id===selP.id?Object.assign({},pp,{emoji:e.target.value}):pp;});});}} style={{width:50,padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:18,textAlign:"center",fontFamily:"inherit"}}/></div>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Frequency</div><select value={selP.freq} onChange={function(e){setPpl(function(ps){return ps.map(function(pp){return pp.id===selP.id?Object.assign({},pp,{freq:e.target.value}):pp;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}><option value="core">Core</option><option value="extended">Extended</option><option value="occasional">Occasional</option></select></div>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Age</div><select value={selP.age} onChange={function(e){setPpl(function(ps){return ps.map(function(pp){return pp.id===selP.id?Object.assign({},pp,{age:e.target.value}):pp;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}><option value="adult">Adult</option><option value="child">Child</option><option value="toddler">Toddler</option><option value="baby">Baby</option></select></div>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Gender</div><select value={selP.g||"m"} onChange={function(e){setPpl(function(ps){return ps.map(function(pp){return pp.id===selP.id?Object.assign({},pp,{g:e.target.value}):pp;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}><option value="f">Female</option><option value="m">Male</option></select></div>
    </div>
    <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginTop:12,marginBottom:8}}>Taste profile</div>
    {[{k:"adv",l:"Adventurous",lo:"Picky",hi:"Explorer"},{k:"hc",l:"Health-conscious",lo:"Comfort",hi:"Clean"},{k:"sp",l:"Spice tolerance",lo:"Mild",hi:"Heat"},{k:"meat",l:"Meat preference",lo:"Chicken",hi:"Red meat"},{k:"sweet",l:"Sweet tooth",lo:"Savory",hi:"Sweet"}].map(function(t){return <div key={t.k} style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:12,fontWeight:600,color:"var(--tx2)"}}>{t.l}</span>
        <span style={{fontSize:11,fontWeight:600,color:"var(--ac)"}}>{Math.round((selP[t.k]||.5)*100)}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:11,color:"var(--tx3)",width:52,textAlign:"right"}}>{t.lo}</span>
        <input type="range" min="0" max="100" value={Math.round((selP[t.k]||.5)*100)} onChange={function(e){var v=parseInt(e.target.value)/100,key=t.k;setPpl(function(ps){return ps.map(function(pp){if(pp.id===selP.id){var n=Object.assign({},pp);n[key]=v;return n;}return pp;});});}} style={{flex:1}}/>
        <span style={{fontSize:11,color:"var(--tx3)",width:52}}>{t.hi}</span>
      </div>
    </div>;})}
    <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginTop:16,marginBottom:8}}>Restaurant modifiers</div>
    <div style={{fontSize:11,color:"var(--tx3)",marginBottom:8}}>Custom boosts or penalties when this person is in the group</div>
    {(selP.mods||[]).map(function(mod,mi){return <div key={mi} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,padding:"6px 8px",borderRadius:6,background:mod.w>0?"rgba(74,158,255,.08)":"rgba(255,100,100,.08)",border:"1px solid "+(mod.w>0?"rgba(74,158,255,.2)":"rgba(255,100,100,.2)")}}>
      <span style={{fontSize:13,width:20,textAlign:"center"}}>{mod.w>0?"↑":"↓"}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:600,color:"var(--tx1)"}}>{mod.rid?rests.find(function(r){return r.id===mod.rid;})?rests.find(function(r){return r.id===mod.rid;}).name:mod.rid:mod.cat?(mod.cat.charAt(0).toUpperCase()+mod.cat.slice(1))+" (category)":""}{mod.solo?" (solo only)":""}</div>
        <div style={{fontSize:10,color:"var(--tx2)"}}>{mod.label} · weight: {mod.w>0?"+":""}{mod.w}</div>
      </div>
      <button onClick={function(){if(confirm("Remove this modifier?")){var idx=mi;setPpl(function(ps){return ps.map(function(pp){if(pp.id!==selP.id)return pp;var nm=(pp.mods||[]).filter(function(_,i){return i!==idx;});return Object.assign({},pp,{mods:nm});});});}}} style={{background:"none",border:"none",color:"var(--tx3)",cursor:"pointer",fontSize:14,padding:"2px 4px"}}>×</button>
    </div>;})}
    {!showAddMod?<button className="jfl-btn" style={{fontSize:11,width:"100%",marginTop:4}} onClick={function(){setShowAddMod(true);}}>+ Add modifier</button>:<div style={{marginTop:6,padding:10,borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg2)"}}>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <select value={aType} onChange={function(e){setAType(e.target.value);setATarget("");}} style={{flex:1,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit"}}><option value="rid">Specific restaurant</option><option value="cat">Category</option></select>
        {aType==="rid"?<select value={aTarget} onChange={function(e){setATarget(e.target.value);}} style={{flex:2,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit"}}><option value="">Pick...</option>{rests.filter(function(r){return!r.bo;}).sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(r){return <option key={r.id} value={r.id}>{r.name}</option>;})}</select>:<select value={aTarget} onChange={function(e){setATarget(e.target.value);}} style={{flex:2,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit"}}><option value="">Pick...</option>{["asian","bbq","breakfast","burgers","casual-dining","coffee-snack","convenience","dessert","fast-casual","fast-food","healthy","indian","italian","mexican","pizza","subs","wings"].map(function(c){return <option key={c} value={c}>{c}</option>;})}</select>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <input type="text" placeholder="Label (e.g. Dislikes spicy food)" value={aLabel} onChange={function(e){setALabel(e.target.value);}} style={{flex:2,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit"}}/>
        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"var(--tx3)"}}>Wt</span><input type="number" value={aWeight} onChange={function(e){setAWeight(parseInt(e.target.value)||0);}} style={{width:48,padding:"5px 6px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg0)",color:"var(--tx1)",fontSize:11,fontFamily:"inherit",textAlign:"center"}}/></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--tx2)",cursor:"pointer"}}><input type="checkbox" checked={aSolo} onChange={function(e){setASolo(e.target.checked);}}/>Solo only</label>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button className="jfl-btn" style={{flex:1,fontSize:11}} onClick={function(){if(!aTarget||!aLabel)return;var mod={w:aWeight,label:aLabel};if(aType==="rid")mod.rid=aTarget;else mod.cat=aTarget;if(aSolo)mod.solo=true;setPpl(function(ps){return ps.map(function(pp){if(pp.id!==selP.id)return pp;return Object.assign({},pp,{mods:(pp.mods||[]).concat([mod])});});});setShowAddMod(false);setATarget("");setALabel("");setAWeight(5);setASolo(false);}}>Save</button>
        <button className="jfl-btn" style={{flex:1,fontSize:11}} onClick={function(){setShowAddMod(false);}}>Cancel</button>
      </div>
    </div>}
    <button className="jfl-btn" style={{fontSize:11,color:"var(--red)",borderColor:"var(--red)",marginTop:12}} onClick={function(){if(confirm("Delete "+selP.name+"? This removes all their data and modifiers.")){if(confirm("Are you sure? This cannot be undone.")){var pid=selP.id;setPpl(function(ps){return ps.filter(function(pp){return pp.id!==pid;});});if(setSel)setSel(function(s){return Object.assign({},s,{sp:(s.sp||[]).filter(function(id){return id!==pid;})});});setGroups(function(gs){return gs.map(function(g){return Object.assign({},g,{people:g.people.filter(function(id){return id!==pid;})});});});if(setQR){var ql=qrCustom||QR_DEFAULTS;var nq=ql.map(function(q){return Object.assign({},q,{g:(q.g||[]).filter(function(id){return id!==pid;})});});setQR(nq);}setSelPId(null);}}}}>Delete person</button>
  </Sheet>}
  {selG&&<Sheet icon={selG.emoji} title={selG.name} onClose={function(){setSelGId(null);}}>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Name</div><input type="text" value={selG.name} onChange={function(e){setGroups(function(gs){return gs.map(function(g){return g.id===selG.id?Object.assign({},g,{name:e.target.value}):g;});});}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:13,fontFamily:"inherit"}}/></div>
      <div><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Emoji</div><input type="text" value={selG.emoji} onChange={function(e){setGroups(function(gs){return gs.map(function(g){return g.id===selG.id?Object.assign({},g,{emoji:e.target.value}):g;});});}} style={{width:50,padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:18,textAlign:"center",fontFamily:"inherit"}}/></div>
    </div>
    <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:10}}>Members</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
      {ppl.map(function(p){var inG=selG.people.indexOf(p.id)>=0;return <button key={p.id} onClick={function(){setGroups(function(gs){return gs.map(function(g){if(g.id!==selG.id)return g;var np=inG?g.people.filter(function(x){return x!==p.id;}):g.people.concat([p.id]);return Object.assign({},g,{people:np});});});}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(inG?"var(--ac)":"var(--bdr)"),background:inG?"rgba(244,114,182,.15)":"var(--bg2)",color:inG?"var(--ac)":"var(--tx2)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.emoji+" "+p.name}</button>;})}
    </div>
    {(function(){var FEMALE_IDS=["jenna","madi","emmy","jenna-mom","kevin-mom","zoe","leah","tara","amanda","zara"];var members=selG.people.map(function(id){return ppl.find(function(p){return p.id===id;});}).filter(Boolean);if(members.length<1)return null;
      var traits=[{k:"adv",l:"Adventurous",lo:"Picky",hi:"Explorer"},{k:"hc",l:"Health-conscious",lo:"Comfort",hi:"Clean"},{k:"sp",l:"Spice",lo:"Mild",hi:"Heat"},{k:"meat",l:"Meat pref",lo:"Chicken",hi:"Red meat"},{k:"sweet",l:"Sweet tooth",lo:"Savory",hi:"Sweet"}];
      var avgs={};traits.forEach(function(t){var sum=0,wt=0;members.forEach(function(p){var w=FEMALE_IDS.indexOf(p.id)>=0?1.3:1;sum+=(p[t.k]||.5)*w;wt+=w;});avgs[t.k]=wt>0?sum/wt:.5;});
      return <div style={{marginTop:4,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--tx2)",marginBottom:8}}>Group taste profile</div>
        <div style={{fontSize:11,color:"var(--tx3)",marginBottom:10}}>Weighted average · women count 1.3×</div>
        {traits.map(function(t){var v=avgs[t.k];return <div key={t.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:600,color:"var(--tx2)",width:90}}>{t.l}</span>
          <div style={{flex:1,height:6,background:"var(--bdr)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:(v*100)+"%",background:"var(--ac)",borderRadius:3,transition:"width .3s"}}></div></div>
          <span style={{fontSize:11,fontWeight:600,color:"var(--ac)",width:28,textAlign:"right"}}>{Math.round(v*100)}</span>
        </div>;})}
      </div>;})()}
    <button className="jfl-btn" style={{fontSize:11,color:"var(--red)",borderColor:"var(--red)"}} onClick={function(){if(confirm("Delete group "+selG.name+"? This removes the group and its member list.")){if(confirm("Are you sure? This cannot be undone.")){setGroups(function(gs){return gs.filter(function(g){return g.id!==selG.id;});});setSelGId(null);}}}}>Delete group</button>
  </Sheet>}
  {selQR&&<Sheet icon={selQR.e} title={selQR.l} onClose={function(){setSelQRIdx(null);}}>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Label</div><input type="text" value={selQR.l} onChange={function(e){var v=e.target.value,idx=selQRIdx;var nq=qrList.slice();nq[idx]=Object.assign({},nq[idx],{l:v});setQR(nq);}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:13,fontFamily:"inherit"}}/></div>
      <div><div style={{fontSize:11,fontWeight:500,color:"var(--tx3)",marginBottom:3}}>Emoji</div><input type="text" value={selQR.e} onChange={function(e){var v=e.target.value,idx=selQRIdx;var nq=qrList.slice();nq[idx]=Object.assign({},nq[idx],{e:v});setQR(nq);}} style={{width:50,padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:18,textAlign:"center",fontFamily:"inherit"}}/></div>
    </div>
    <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:10}}>People</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
      {ppl.map(function(p){var inQ=selQR.g.indexOf(p.id)>=0;return <button key={p.id} onClick={function(){var idx=selQRIdx;var nq=qrList.slice();var np=inQ?selQR.g.filter(function(x){return x!==p.id;}):selQR.g.concat([p.id]);nq[idx]=Object.assign({},nq[idx],{g:np});setQR(nq);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(inQ?"var(--ac)":"var(--bdr)"),background:inQ?"rgba(244,114,182,.15)":"var(--bg2)",color:inQ?"var(--ac)":"var(--tx2)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{p.emoji+" "+p.name}</button>;})}
    </div>
    <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:10}}>Mood</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
      {MOODS.map(function(m){return <button key={m.id} onClick={function(){var idx=selQRIdx;var nq=qrList.slice();nq[idx]=Object.assign({},nq[idx],{m:m.id});setQR(nq);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(selQR.m===m.id?"var(--ac)":"var(--bdr)"),background:selQR.m===m.id?"rgba(244,114,182,.15)":"var(--bg2)",color:selQR.m===m.id?"var(--ac)":"var(--tx2)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.emoji+" "+m.label}</button>;})}
    </div>
    <div style={{fontSize:11,fontWeight:600,color:"var(--tx3)",marginBottom:6}}>Show for meals</div>
    <div style={{fontSize:10,color:"var(--tx2)",marginBottom:8}}>Leave all off to show at every meal</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
      {["breakfast","brunch","lunch","dinner","latenight"].map(function(ml){var meals=selQR.meals||[];var on=meals.indexOf(ml)>=0;return <button key={ml} onClick={function(){var idx=selQRIdx;var nq=qrList.slice();var cur=nq[idx].meals||[];var nm=on?cur.filter(function(x){return x!==ml;}):cur.concat([ml]);nq[idx]=Object.assign({},nq[idx],{meals:nm});setQR(nq);}} style={{padding:"5px 12px",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.12)":"var(--bg1)",color:on?"var(--ac)":"var(--tx3)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{ml==="latenight"?"Late Night":ml.charAt(0).toUpperCase()+ml.slice(1)}</button>;})}
    </div>
    <button className="jfl-btn" style={{fontSize:11,color:"var(--red)",borderColor:"var(--red)"}} onClick={function(){if(confirm("Delete this shortcut?")){var nq=qrList.filter(function(_,i){return i!==selQRIdx;});setQR(nq.length>0?nq:null);setSelQRIdx(null);}}}>Delete shortcut</button>
  </Sheet>}

  {/* ═══ SETTINGS MENU ═══ */}
  {page==="menu"&&<div>
    <div style={{position:"relative",padding:"8px 16px 5px",background:"var(--bg2)",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{zIndex:1,cursor:"pointer"}} onClick={props.onLogo}><div style={{fontSize:20,fontWeight:800,letterSpacing:-.8,lineHeight:1}}><span style={{color:"var(--ac)"}}>Jenna</span><span style={{color:"var(--tx1)"}}>rate</span></div><div style={{fontSize:9,fontWeight:1000,color:"var(--tx2)",marginTop:2,letterSpacing:1.8,textTransform:"uppercase",textAlign:"center",maxWidth:82}}>Food Logic</div></div>
      <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none",padding:"0 90px",fontSize:14,fontWeight:700,color:"var(--tx1)"}}>Settings</div>
      <div style={{display:"flex",alignItems:"center",gap:10,zIndex:1}}>{(function(){var _d=props.theme==="dark"||((!props.theme||props.theme==="auto")&&window.matchMedia&&!window.matchMedia("(prefers-color-scheme:light)").matches);var _ib=_d?{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)"}:{background:"rgba(0,0,0,.06)",border:"1px solid rgba(0,0,0,.08)"};var _ibs=Object.assign({},_ib,{borderRadius:10,padding:6,cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34});return <>{props.onTheme&&<button onClick={props.onTheme} style={Object.assign({},_ibs,{opacity:.8})}>{_d?"🌙":"☀️"}</button>}{props.onInfo?<button onClick={props.onInfo} style={_ibs}>{"ℹ️"}</button>:<div style={{width:34}}></div>}</>;})()}</div>
    </div>
    <div style={{padding:"12px 16px 80px",display:"flex",flexDirection:"column",gap:8}}>
      {[
        {icon:"\uD83C\uDF7D\uFE0F",label:"Restaurants",sub:rests.length+" in rotation",pg:"restaurants"},
        {icon:"\uD83D\uDC65",label:"People & Groups",sub:ppl.length+" people \u00B7 "+groups.length+" groups",pg:"people"},
        {icon:"\u26A1",label:"How Scoring Works",sub:"Weights, toggles, global rules",pg:"engine"},
        {icon:"\u23F0",label:"Meal Schedule",sub:"When each meal period starts",pg:"schedule"},
        {icon:"\uD83C\uDFAF",label:"Obvious Choices",sub:"Auto-detect obvious picks",pg:"obvious"}
      ].map(function(item){return <button key={item.pg} className="jfl-card" onClick={function(){setPage(item.pg);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
        <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--tx1)"}}>{item.label}</div>
          <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{item.sub}</div>
        </div>
        <span style={{fontSize:14,color:"var(--tx3)"}}>{"\u203A"}</span>
      </button>;})}
      <div className="jfl-card" style={{padding:"14px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{"\uD83C\uDF17"}</span>
            <div style={{fontSize:14,fontWeight:600,color:"var(--tx1)"}}>Appearance</div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {[{id:"auto",l:"Auto"},{id:"dark",l:"Dark"},{id:"light",l:"Light"}].map(function(t){var on=(props.gs2.theme||"auto")===t.id;return <button key={t.id} onClick={function(){props.setGs2(function(prev){return Object.assign({},prev,{theme:t.id});});}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(on?"var(--ac)":"var(--bdr)"),background:on?"rgba(244,114,182,.15)":"var(--bg1)",color:on?"var(--ac)":"var(--tx2)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t.l}</button>;})}
          </div>
        </div>
      </div>
      <button className="jfl-card" onClick={function(){setPage("data");}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
        <span style={{fontSize:20,width:28,textAlign:"center"}}>{"\uD83D\uDCCA"}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--tx1)"}}>DoorDash Data</div>
          <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{props.dataRefresh?(function(){try{var d=new Date(props.dataRefresh+"T12:00:00");var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return"Last import: "+mo[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}catch(e){return"Last import: "+props.dataRefresh;}})():"No data imported yet"}</div>
        </div>
        <span style={{fontSize:18,fontWeight:700,color:"var(--tx3)"}}>{"\u27F6"}</span>
      </button>
      <div style={{textAlign:"center",marginTop:16}}><div className="jfl-footer">{"\u00A9 2026 Madden Frameworks. All rights reserved."}</div></div>
      <div style={{textAlign:"center",marginTop:12}}>
        <button style={{fontSize:10,padding:"6px 12px",color:factoryStep===2?"var(--red)":factoryStep===1?"var(--red)":"var(--tx3)",background:factoryStep===2?"rgba(255,20,20,.2)":factoryStep===1?"rgba(255,60,60,.1)":"none",border:factoryStep===2?"1px solid var(--red)":factoryStep===1?"1px solid var(--red)":"1px solid var(--bdr)",borderRadius:6,cursor:"pointer",fontFamily:"inherit",opacity:factoryStep?1:.5,transition:"all .2s",fontWeight:factoryStep===2?700:400}} onClick={function(){if(factoryStep===2){localStorage.removeItem(SK);window.location.reload();}else{setFactoryStep(function(s){return(s||0)+1;});setTimeout(function(){setFactoryStep(0);},6000);}}}>{factoryStep===2?"Last chance. Tap to erase everything permanently.":factoryStep===1?"Tap again to confirm \u2014 this erases everything":"Factory Reset"}</button>
      </div>
    </div>
  </div>}

  {/* ═══ RESTAURANTS ═══ */}
  {page==="restaurants"&&<div>
    <SubBar title="Restaurants"/>
    <div style={{padding:"12px 16px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:11,color:"var(--tx3)",fontWeight:500}}>Sort by</span>
        <select value={restSort} onChange={function(e){setRestSort(e.target.value);}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:11,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>
          <option value="name">{"\uD83D\uDD24 A\u2013Z"}</option>
          <option value="orders">{"\uD83D\uDCE6 Most orders"}</option>
          <option value="recent">{"\uD83D\uDD50 Most recent"}</option>
          <option value="cuisine">{"\uD83C\uDF7D Cuisine"}</option>
        </select>
      </div>
      {restSort==="cuisine"?(function(){var sorted=rests.slice().sort(function(a,b){return(a.cat||"zzz").localeCompare(b.cat||"zzz")||a.name.localeCompare(b.name);});var groups={};sorted.forEach(function(r){var c=r.cat||"other";if(!groups[c])groups[c]=[];groups[c].push(r);});var CAT_LABELS={"fast-food":"Fast Food","fast-casual":"Fast Casual","casual-dining":"Casual Dining","coffee-snack":"Coffee & Snacks",burgers:"Burgers",pizza:"Pizza",subs:"Subs & Sandwiches",asian:"Asian",mexican:"Mexican",italian:"Italian",indian:"Indian",healthy:"Healthy",bbq:"BBQ",wings:"Wings",breakfast:"Breakfast",dessert:"Dessert",other:"Other"};return Object.keys(groups).sort().map(function(cat){return <div key={cat} style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:.5,marginBottom:6,paddingLeft:2}}>{CAT_LABELS[cat]||cat}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {groups[cat].map(function(r){return <button key={r.id} onClick={function(){setSelId(r.id);setInStep(0);}} className="jfl-card" aria-label={r.bo?(r.sn||r.name)+" (burned out)":(r.sn||r.name)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%",opacity:r.bo?0.4:1}}>
          <span style={{fontSize:20}}>{r.emoji}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontWeight:700,fontSize:13,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sn||r.name}</span>{r.fav&&<span style={{fontSize:8,fontWeight:700,color:"var(--ac)",background:"rgba(244,114,182,.15)",padding:"1px 4px",borderRadius:3,letterSpacing:.5,flexShrink:0}}>FAV</span>}</div>
            <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{r.to+(r.to===1?" order":" orders")+(r.ld?" \u00B7 "+fmtDate(r.ld):"")}</div>
          </div>
        </button>;})}
        </div>
      </div>;});})()
      :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {rests.slice().sort(function(a,b){if(restSort==="orders")return b.to-a.to;if(restSort==="recent"){var da=a.ld?new Date(a.ld).getTime():0;var db=b.ld?new Date(b.ld).getTime():0;return db-da;}return a.name.localeCompare(b.name);}).map(function(r){return <button key={r.id} onClick={function(){setSelId(r.id);setInStep(0);}} className="jfl-card" aria-label={r.bo?(r.sn||r.name)+" (burned out)":(r.sn||r.name)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%",opacity:r.bo?0.4:1}}>
        <span style={{fontSize:20}}>{r.emoji}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontWeight:700,fontSize:13,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sn||r.name}</span>{r.fav&&<span style={{fontSize:8,fontWeight:700,color:"var(--ac)",background:"rgba(244,114,182,.15)",padding:"1px 4px",borderRadius:3,letterSpacing:.5,flexShrink:0}}>FAV</span>}</div>
          <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{r.to+(r.to===1?" order":" orders")+(r.ld?" · "+fmtDate(r.ld):"")}</div>
        </div>
      </button>;})}
      </div>}
    </div>
  </div>}

  {/* ═══ PEOPLE & GROUPS ═══ */}
  {page==="people"&&<div>
    <SubBar title="People & Groups"/>
    <div style={{padding:"12px 16px 80px"}}>
      <div className="jfl-label" style={{marginBottom:10}}>People</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {ppl.map(function(p){return <button key={p.id} onClick={function(){setSelPId(p.id);}} className="jfl-card" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
        <span style={{fontSize:20}}>{p.emoji}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:1}}>{p.freq+" · "+p.age}</div>
        </div>
      </button>;})}
      </div>
      <button className="jfl-btn" style={{marginTop:10,width:"100%",fontSize:12}} onClick={function(){var nid="person-"+Date.now();setPpl(function(ps){return ps.concat([{id:nid,name:"New Person",freq:"occasional",age:"adult",emoji:"🧑",g:"m",adv:.5,hc:.5,sp:.5,meat:.5,sweet:.5}]);});setSelPId(nid);}}>+ Add person</button>

      <div className="jfl-label" style={{marginTop:20,marginBottom:10}}>Groups</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {groups.map(function(g){return <button key={g.id} onClick={function(){setSelGId(g.id);}} className="jfl-card" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
        <span style={{fontSize:20}}>{g.emoji}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:1}}>{g.people.length+(g.people.length===1?" person":" people")}</div>
        </div>
      </button>;})}
      </div>
      <button className="jfl-btn" style={{marginTop:8,width:"100%",fontSize:12}} onClick={function(){var nid="group-"+Date.now();setGroups(function(gs){return gs.concat([{id:nid,name:"New Group",emoji:"👥",people:[]}]);});setSelGId(nid);}}>+ Add group</button>

      <div className="jfl-label" style={{marginTop:20,marginBottom:8}}>Quick Resolves</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {qrList.map(function(q,i){var mealLabel=(!q.meals||q.meals.length===0)?"All meals":q.meals.map(function(ml){return ml==="latenight"?"Late":ml==="breakfast"?"Brkfst":ml==="brunch"?"Brnch":ml==="dinner"?"Dinner":ml==="lunch"?"Lunch":ml;}).join(" · ");return <button key={i} onClick={function(){setSelQRIdx(i);}} className="jfl-card" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
        <span style={{fontSize:18}}>{q.e}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--tx2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.l}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:1}}>{mealLabel}</div>
        </div>
      </button>;})}
      </div>
      <button className="jfl-btn" style={{marginTop:8,width:"100%",fontSize:12}} onClick={function(){var nq=qrList.concat([{l:"New Shortcut",e:"⚡",g:["kevin","jenna"],m:"balanced",meals:[]}]);setQR(nq);setSelQRIdx(nq.length-1);}}>+ Add shortcut</button>
      {qrCustom&&<button className="jfl-btn" style={{marginTop:10,width:"100%",fontSize:11,color:"var(--tx3)"}} onClick={function(){setQR(null);}}>Reset to defaults</button>}
    </div>
  </div>}

  {/* ═══ MEAL SCHEDULE ═══ */}
  {page==="schedule"&&<div>
    <SubBar title="Meal Schedule"/>
    <div style={{padding:"12px 16px 24px"}}>
      <div style={{fontSize:12,color:"var(--tx2)",marginBottom:12}}>Set when each meal period starts and ends.</div>
      {(function(){var mt=props.customMealTimes||DEFAULT_MEAL_TIMES;function fmtH(h){var hr=Math.floor(h);var min=Math.round((h-hr)*60);var ampm=hr<12||(hr===0)?"AM":"PM";var d=hr===0?12:hr>12?hr-12:hr;if(hr===24){d=12;ampm="AM";}return d+(min>0?":"+String(min).padStart(2,"0"):"")+(" "+ampm);}function halfHourOpts(){var opts=[];for(var i=0;i<48;i++)opts.push(i/2);return opts;}return MEAL_DEFS.map(function(m){var range=mt[m.id]||DEFAULT_MEAL_TIMES[m.id];var startH=range[0],endH=range[1];return <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"14px 0",borderBottom:"1px solid var(--bdr)"}}>
        <span style={{fontSize:18,width:26}}>{m.emoji}</span>
        <span style={{fontSize:13,fontWeight:600,color:"var(--tx1)",flex:1,minWidth:60}}>{m.label}</span>
        <select value={startH} onChange={function(e){var v=parseFloat(e.target.value);var nmt=Object.assign({},mt);nmt[m.id]=[v,endH];props.setMealTimes(nmt);}} style={{padding:"6px 4px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}>
          {halfHourOpts().map(function(h){return <option key={h} value={h}>{fmtH(h)}</option>;})}
        </select>
        <span style={{fontSize:11,color:"var(--tx3)"}}>to</span>
        <select value={endH} onChange={function(e){var v=parseFloat(e.target.value);var nmt=Object.assign({},mt);nmt[m.id]=[startH,v];props.setMealTimes(nmt);}} style={{padding:"6px 4px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit"}}>
          {halfHourOpts().map(function(h){return <option key={h} value={h}>{fmtH(h)}</option>;})}
        </select>
      </div>;});})()}
      {props.customMealTimes&&<button className="jfl-btn" style={{marginTop:12,width:"100%",fontSize:12,color:"var(--tx3)"}} onClick={function(){props.setMealTimes(null);}}>Reset to defaults</button>}
      {(function(){var mt=props.customMealTimes||DEFAULT_MEAL_TIMES;var now=new Date();var h=now.getHours()+now.getMinutes()/60;var cur=null;MEAL_DEFS.forEach(function(m){var range=mt[m.id]||DEFAULT_MEAL_TIMES[m.id];var s=range[0],e=range[1];if(e<s){if(h>=s||h<e)cur=m;}else{if(h>=s&&h<e)cur=m;}});return <div className="jfl-card" style={{marginTop:20,padding:"14px 16px",borderLeft:"3px solid var(--ac)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:16}}>{cur?cur.emoji:"\uD83D\uDD50"}</span>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ac)"}}>{cur?"It\u2019s "+cur.label+" time!":"Between meals"}</div>
        </div>
        <div style={{fontSize:11,color:"var(--tx3)",lineHeight:"1.5"}}>The app uses these windows to auto-detect what meal you're choosing for, filter restaurants by meal eligibility, and decide which QR shortcuts to show.</div>
      </div>;})()}
    </div>
  </div>}

  {/* ═══ OBVIOUS CHOICES ═══ */}
  {page==="obvious"&&<div>
    <SubBar title="Obvious Choices"/>
    <div style={{padding:"12px 16px 24px"}}>
      <div style={{fontSize:12,color:"var(--tx2)",marginBottom:12}}>Auto-detected picks that skip the quiz.</div>
      {(function(){var rules=props.obvRules||OBVIOUS_RULES;
        var MEAL_LABELS={breakfast:"Breakfast",brunch:"Brunch",lunch:"Lunch",dinner:"Dinner",latenight:"Late Night"};
        function pplNames(sp){return sp.map(function(id){var p=props.ppl.find(function(pp){return pp.id===id;});return p?p.name:id;}).join(", ");}
        function restName(rid){var r=props.rests.find(function(rr){return rr.id===rid;});return r?r.emoji+" "+r.name:rid;}
        function removeRule(idx){var nr=rules.slice();nr.splice(idx,1);props.setObvRules(nr);setObvEditIdx(null);}
        function updateField(idx,field,val){var nr=rules.map(function(r,i){if(i!==idx)return r;var u=Object.assign({},r);u[field]=val;return u;});props.setObvRules(nr);}
        function addRule(){var nr=rules.concat([{sp:["kevin"],spExact:true,rid:"chick-fil-a",meals:["dinner"],callout:"Let's be real.",ask:"You already know, right?",yes:"Knew it.",no:"Okay then."}]);props.setObvRules(nr);setObvEditIdx(nr.length-1);}
        function toggleMeal(idx,meal){var r=rules[idx];var meals=(r.meals||[]).slice();var mi=meals.indexOf(meal);if(mi>=0)meals.splice(mi,1);else meals.push(meal);updateField(idx,"meals",meals);}
        return <div>
          {rules.map(function(rule,idx){var editing=obvEditIdx===idx;
            var r=props.rests.find(function(rr){return rr.id===rule.rid;});var rEmoji=r?r.emoji:"\uD83C\uDF7D\uFE0F";var rName=r?(r.sn||r.name):rule.rid;
            /* Match rule.sp to a group if possible */
            var grpMatch=null;var allGroups=props.groups||[];
            var spSorted=rule.sp.slice().sort().join(",");
            for(var gi=0;gi<allGroups.length;gi++){var g=allGroups[gi];if(g.people.slice().sort().join(",")===spSorted){grpMatch=g;break;}}
            var whoLabel=grpMatch?grpMatch.name:pplNames(rule.sp);
            var whoEmoji=grpMatch?grpMatch.emoji:(rule.sp.length===1?(function(){var p=props.ppl.find(function(pp){return pp.id===rule.sp[0];});return p?p.emoji:"\uD83D\uDC64";})():"\uD83D\uDC65");
            return <div key={idx} className="jfl-card" style={{marginBottom:8,padding:"10px 12px"}}>
              {!editing&&<div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{whoEmoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"var(--tx1)"}}>{whoLabel}</span>
                      <span style={{fontSize:9,color:"var(--tx3)"}}>{"\u00B7"}</span>
                      {(rule.meals||[]).map(function(m){return <span key={m} style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:"rgba(244,114,182,.1)",color:"var(--ac)"}}>{MEAL_LABELS[m]||m}</span>;})}
                    </div>
                    <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      {rule.sp.map(function(id){var p=props.ppl.find(function(pp){return pp.id===id;});var label=p?p.name:id;if(rule.sp.length===1)label="only "+label;return <span key={id} style={{fontSize:9,fontWeight:500,padding:"2px 6px",borderRadius:4,border:"1px solid var(--bdr)",background:"var(--bg1)",color:"var(--tx3)"}}>{label}</span>;})}
                    </div>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:"var(--tx2)"}}>{rEmoji+" "+rName}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                  <div style={{fontSize:11,color:"var(--tx2)",fontStyle:"italic",flex:1}}>{"\u201C"+rule.ask+"\u201D"}</div>
                  <div style={{display:"flex",gap:6,marginLeft:8,flexShrink:0}}>
                    <button className="jfl-btn" style={{fontSize:10,padding:"3px 8px"}} onClick={function(){setObvEditIdx(idx);}}>Edit</button>
                    <button className="jfl-btn" style={{fontSize:10,padding:"3px 8px",color:"var(--red)",borderColor:"var(--red)"}} onClick={function(){if(confirm("Remove this obvious choice?"))removeRule(idx);}}>Remove</button>
                  </div>
                </div>
              </div>}
              {editing&&<div>
                <div className="jfl-label" style={{marginBottom:6}}>Who</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {props.ppl.map(function(p){var on=rule.sp.indexOf(p.id)>=0;return <button key={p.id} className={on?"jfl-pill on":"jfl-pill"} onClick={function(){var nsp=on?rule.sp.filter(function(x){return x!==p.id;}):rule.sp.concat([p.id]);updateField(idx,"sp",nsp);}} style={{fontSize:11}}><span>{p.emoji}</span><span>{p.name}</span></button>;})}
                </div>
                <div className="jfl-label" style={{marginBottom:6}}>Restaurant</div>
                <select value={rule.rid} onChange={function(e){updateField(idx,"rid",e.target.value);}} style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",marginBottom:10}}>
                  {props.rests.map(function(r){return <option key={r.id} value={r.id}>{r.emoji+" "+r.name}</option>;})}
                </select>
                <div className="jfl-label" style={{marginBottom:6}}>Meals</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  {["breakfast","brunch","lunch","dinner","latenight"].map(function(m){var on=(rule.meals||[]).indexOf(m)>=0;return <button key={m} className={on?"jfl-pill on":"jfl-pill"} onClick={function(){toggleMeal(idx,m);}} style={{fontSize:11}}>{MEAL_LABELS[m]}</button>;})}
                </div>
                <div className="jfl-label" style={{marginBottom:4}}>Callout text</div>
                <input value={rule.callout||""} onChange={function(e){updateField(idx,"callout",e.target.value);}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}} placeholder="e.g. Let's be honest."/>
                <div className="jfl-label" style={{marginBottom:4}}>The question</div>
                <input value={rule.ask||""} onChange={function(e){updateField(idx,"ask",e.target.value);}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}} placeholder="e.g. You want Fresh Kitchen, don\u2019t you?"/>
                <div className="jfl-label" style={{marginBottom:4}}>If yes</div>
                <input value={rule.yes||""} onChange={function(e){updateField(idx,"yes",e.target.value);}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}} placeholder="e.g. Stop wasting both our time."/>
                <div className="jfl-label" style={{marginBottom:4}}>If no</div>
                <input value={rule.no||""} onChange={function(e){updateField(idx,"no",e.target.value);}} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid var(--bdr)",background:"var(--bg2)",color:"var(--tx1)",fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}} placeholder="e.g. Interesting. Proceed."/>
                <button className="jfl-cta" style={{padding:10,fontSize:12,marginTop:4}} onClick={function(){setObvEditIdx(null);}}>Done</button>
              </div>}
            </div>;
          })}
          <button className="jfl-btn" style={{width:"100%",marginTop:8,fontSize:12}} onClick={addRule}>+ Add obvious choice</button>
          <button className="jfl-btn" style={{width:"100%",marginTop:8,fontSize:11,color:"var(--tx3)"}} onClick={function(){props.setObvRules(null);}}>Reset to defaults</button>
        </div>;})()}
    </div>
  </div>}

  {/* ═══ DOORDASH DATA ═══ */}
  {page==="data"&&<div>
    <SubBar title="DoorDash Data"/>
    <div style={{padding:"16px 16px 24px"}}>
      {(function(){
        var totalOrders=0,restsWithData=0;var topRest=null,topCount=0;
        props.rests.forEach(function(r){if(r.to>0){totalOrders+=r.to;restsWithData++;if(r.to>topCount){topCount=r.to;topRest=r;}}});
        var hasData=props.dataRefresh&&totalOrders>0;
        function fmtImportDate(ds){try{var d=new Date(ds+"T12:00:00");var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return mo[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}catch(e){return ds;}}
        function nextDueDate(ds){try{var d=new Date(ds+"T12:00:00");d.setDate(d.getDate()+90);var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return mo[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();}catch(e){return"—";}}

        return <div>
          {/* ── Import + Status card ── */}
          <div className="jfl-card" style={{padding:"14px 16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:20}}>{"\uD83D\uDCCA"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx1)"}}>Import Order History</div>
                <div style={{fontSize:11,color:"var(--tx2)",marginTop:1}}>Refreshes order counts & restaurant data</div>
              </div>
              {props.dataRefresh&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,background:props.needsRefresh?"rgba(248,113,113,.1)":"rgba(52,211,153,.1)",border:"1px solid "+(props.needsRefresh?"rgba(248,113,113,.25)":"rgba(52,211,153,.25)")}}>
                <span style={{fontSize:12}}>{props.needsRefresh?"\u274C":"\u2705"}</span>
                <span style={{fontSize:10,fontWeight:700,color:"var(--tx1)"}}>{props.needsRefresh?"Outdated":"Current"}</span>
              </div>}
            </div>
            {props.dataRefresh&&<div style={{display:"flex",gap:12,marginBottom:12,padding:"10px 12px",borderRadius:8,background:"var(--bg1)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--tx2)",textTransform:"uppercase",letterSpacing:.5}}>Last import</div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)",marginTop:2}}>{fmtImportDate(props.dataRefresh)}</div>
              </div>
              <div style={{width:1,background:"var(--bdr)"}}></div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--tx2)",textTransform:"uppercase",letterSpacing:.5}}>Next due by</div>
                <div style={{fontSize:13,fontWeight:700,color:props.needsRefresh?"var(--yel)":"var(--tx1)",marginTop:2}}>{nextDueDate(props.dataRefresh)}</div>
              </div>
            </div>}
            <label style={{display:"block",padding:"14px 0",borderRadius:8,border:"2px dashed var(--bdr)",textAlign:"center",cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--ac)",background:"rgba(244,114,182,.05)"}}>
              {uplStatus==="parsing"?"\u23F3 Processing...":"\uD83D\uDCC2 Upload CSV"}
              <input type="file" accept=".csv,.txt,.zip" onChange={handleUpload} style={{display:"none"}}/>
            </label>
            {uplMsg&&<div style={{fontSize:12,fontWeight:500,color:uplStatus==="error"?"var(--red)":uplStatus==="done"?"var(--grn)":"var(--tx2)",lineHeight:"1.5",textAlign:"center",marginTop:8}}>{uplMsg}</div>}
            <div style={{fontSize:11,color:"var(--tx2)",marginTop:10,lineHeight:"1.5",textAlign:"center"}}>{"DoorDash.com \u2192 Account \u2192 Privacy \u2192 Request Archive"}</div>
          </div>

          {/* ── Snapshot ── */}
          {hasData&&<div className="jfl-card" style={{padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
              <span style={{fontSize:14}}>{"\uD83D\uDCF8"}</span>
              <span style={{fontSize:12,fontWeight:700,color:"var(--tx1)",textTransform:"uppercase",letterSpacing:.8}}>Snapshot</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
              <div style={{textAlign:"center",padding:"0 4px"}}>
                <span style={{fontSize:20}}>{"\uD83E\uDDFE"}</span>
                <div style={{fontSize:18,fontWeight:800,color:"var(--tx1)",marginTop:6,lineHeight:1}}>{totalOrders}</div>
                <div style={{fontSize:10,fontWeight:600,color:"var(--tx2)",marginTop:4}}>orders</div>
              </div>
              <div style={{textAlign:"center",padding:"0 4px",borderLeft:"1px solid var(--bdr)",borderRight:"1px solid var(--bdr)"}}>
                <span style={{fontSize:20}}>{"\uD83C\uDFEA"}</span>
                <div style={{fontSize:18,fontWeight:800,color:"var(--tx1)",marginTop:6,lineHeight:1}}>{restsWithData}</div>
                <div style={{fontSize:10,fontWeight:600,color:"var(--tx2)",marginTop:4}}>restaurants</div>
              </div>
              <div style={{textAlign:"center",padding:"0 4px"}}>
                <span style={{fontSize:20}}>{"\uD83E\uDD47"}</span>
                {(function(){var n=topRest?(topRest.sn||topRest.name):"\u2014";var sz=n.length<=10?18:n.length<=14?15:n.length<=18?13:11;return <div style={{fontSize:sz,fontWeight:800,color:"var(--tx1)",marginTop:6,lineHeight:1.1}}>{n}</div>;})()}
                <div style={{fontSize:10,fontWeight:600,color:"var(--tx2)",marginTop:4}}>#1 spot all time</div>
              </div>
            </div>
          </div>}
        </div>;
      })()}
    </div>
  </div>}
  {page==="engine"&&<div>
    <SubBar title="Scoring Engine"/>
    <div style={{padding:"12px 20px"}}>
    <div style={{fontSize:11,color:"var(--tx2)",marginBottom:14}}>These rules affect how every restaurant is scored.</div>
    {[
      {k:"femaleWeight",emoji:"👩",l:"The Jenna Coefficient",sub:"Women's food preferences count 1.3× when building the group taste profile",ex:"Jenna's love of healthy food pulls results toward salads more than Kevin's love of burgers pulls toward Five Guys"},
      {k:"dessertPenalty",emoji:"🍰",l:"Cake Is Not a Food Group",sub:"Dessert-only and treat-heavy restaurants are pushed down unless you're in sweet-treat mode",ex:"Keeps Crumbl, Insomnia Cookies, and froyo spots from showing up when you want a real meal"},
      {k:"h2hFemale",emoji:"⚖️",l:"Happy Wife, Happy Life",sub:"When the mood quiz results are tied, women's answers get the deciding vote",ex:"If Kevin says comfort and Jenna says healthy, Jenna wins"}
    ].map(function(t){return <div key={t.k} className="jfl-card" style={{padding:"12px 14px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>{t.emoji}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--tx1)"}}>{t.l}</div>
          <div style={{fontSize:12,color:"var(--tx2)",marginTop:2,lineHeight:"1.4"}}>{t.sub}</div>
        </div>
        <button onClick={function(){var key=t.k;props.setGs2(function(prev){var n=Object.assign({},prev);n[key]=!n[key];return n;});}} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:props.gs2[t.k]?"var(--ac)":"var(--bdr)",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:3,left:props.gs2[t.k]?23:3,transition:"left .2s"}}></div></button>
      </div>
      <div style={{fontSize:11,color:"var(--tx2)",fontStyle:"italic",marginTop:8,paddingTop:8,borderTop:"1px solid var(--bdr)",lineHeight:"1.4"}}>{"e.g. "+t.ex}</div>
    </div>;})}
    <div style={{fontSize:11,color:"var(--tx2)",marginTop:8,padding:"10px 12px",borderRadius:8,background:"var(--bg2)",textAlign:"center",lineHeight:"1.5"}}>{"Per-restaurant and per-person rules are editable in their individual settings pages."}</div>
    </div>
  </div>}

</div>


);
}

var CSS = [
":root,.theme-dark{--bg0:#0D1117;--bg1:#161B22;--bg2:#1C2129;--bdr:#30363D;--tx1:#E6EDF3;--tx2:#8B949E;--tx3:#484F58;--ac:#F472B6;--grn:#D4A574;--yel:#FBBF24;--red:#F87171}",
".theme-light{--bg0:#F5E6E0;--bg1:#FFFFFF;--bg2:#F0DDD6;--bdr:#D9B8AA;--tx1:#2A1215;--tx2:#6B3A3A;--tx3:#9A7070;--ac:#C91A5E;--grn:#A07828;--yel:#B8860B;--red:#C0392B}",
".theme-light .insightsShimmer{color:#7A5518 !important;border-color:rgba(160,120,40,.35) !important}",
".theme-light .jfl-cta{background:linear-gradient(135deg,#E8458A,#D4956A);text-shadow:0 1px 3px rgba(0,0,0,.15)}",
"@keyframes ctaGlowLight{0%,100%{box-shadow:0 3px 16px rgba(214,36,107,.2)}50%{box-shadow:0 5px 28px rgba(214,36,107,.4),0 0 40px rgba(212,149,106,.15)}}",
".theme-light .jfl-cta-hero{box-shadow:0 3px 16px rgba(214,36,107,.25);animation:ctaGlowLight 3s ease-in-out infinite}",
".theme-light .jfl-card{border-color:#E0D0C5;box-shadow:0 2px 8px rgba(120,60,40,.06)}",
".theme-light .jfl-chip.on{border-color:#D6246B;background:rgba(214,36,107,.08);color:#D6246B}",
".theme-light .jfl-stat{box-shadow:0 2px 8px rgba(120,60,40,.06)}",
".theme-light .btm-nav{box-shadow:0 -4px 12px rgba(120,60,40,.08)}",
".btm-nav button:hover{opacity:.7}",
".theme-light .jfl-pill.on{background:linear-gradient(135deg,#E8458A,#D4956A)}",
"@media(prefers-color-scheme:light){.theme-auto{--bg0:#FBF7F4;--bg1:#FFFFFF;--bg2:#F8F2ED;--bdr:#E5D5CA;--tx1:#1A1210;--tx2:#5C4A42;--tx3:#9A857A;--ac:#D6246B;--grn:#A07828;--yel:#B8860B;--red:#C0392B}.theme-auto .jfl-cta{background:linear-gradient(135deg,#E8458A,#D4956A);text-shadow:0 1px 3px rgba(0,0,0,.15)}.theme-auto .jfl-cta-hero{box-shadow:0 3px 16px rgba(214,36,107,.25);animation:ctaGlowLight 3s ease-in-out infinite}.theme-auto .jfl-card{border-color:#E0D0C5}.theme-auto .jfl-chip.on{border-color:#D6246B;background:rgba(214,36,107,.08);color:#D6246B}.theme-auto .jfl-pill.on{background:linear-gradient(135deg,#E8458A,#D4956A)}}",
"*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}",
"html,body{height:100%;overflow:hidden}",
"body{background:var(--bg0)}",
".jfl-root{font-family:'IBM Plex Sans',system-ui,sans-serif;background:var(--bg0);height:100dvh;max-width:480px;margin:0 auto;color:var(--tx1);-webkit-font-smoothing:antialiased;text-wrap:pretty;overflow:hidden}",
"@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}",
"@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}",
"@keyframes spin{to{transform:rotate(360deg)}}",
"@keyframes insightsShimmer{0%,100%{box-shadow:0 0 4px rgba(212,165,116,.2)}50%{box-shadow:0 0 12px rgba(212,165,116,.5),0 0 24px rgba(212,165,116,.2)}}",
".insightsShimmer{animation:insightsShimmer 3s ease-in-out infinite}",
".theme-light .insightsShimmer{animation-name:insightsShimmerLight}",
"@keyframes insightsShimmerLight{0%,100%{box-shadow:0 0 4px rgba(160,120,40,.15)}50%{box-shadow:0 0 14px rgba(180,140,40,.4),0 0 28px rgba(180,140,40,.15)}}",
"@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}",
"@keyframes slotRoll{0%{transform:translateY(100%);opacity:0}15%{transform:translateY(0);opacity:1}85%{transform:translateY(0);opacity:1}100%{transform:translateY(-100%);opacity:0}}",
".slot-roll{animation:slotRoll 6s cubic-bezier(.23,1,.32,1) both}",
".fade{animation:fade .3s ease-out both}.pop{animation:pop .2s ease-out both}.spin{animation:spin .7s linear infinite}",
".stagger-1{animation:fade .3s ease-out .05s both}.stagger-2{animation:fade .3s ease-out .12s both}.stagger-3{animation:fade .3s ease-out .19s both}",
"@keyframes tada{0%{opacity:0;transform:scale(.6);filter:blur(4px)}60%{opacity:1;transform:scale(1.02);filter:blur(0)}100%{transform:scale(1);filter:blur(0)}}",
"@keyframes crownGlow{0%,100%{filter:drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 0 8px rgba(251,191,36,.5))}}",
".crown-glow{animation:crownGlow 2s ease-in-out infinite}",
"@keyframes chipBounce{0%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 8px rgba(244,114,182,.2)}100%{box-shadow:0 0 0 0 transparent}}",
"@keyframes stepOn0{0%,5%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}10%,80%{box-shadow:0 0 0 2px rgba(180,190,200,.6),0 0 12px rgba(180,190,200,.2)}93%,100%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}}",
"@keyframes stepOn1{0%,24%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}30%,80%{box-shadow:0 0 0 2px rgba(244,114,182,.5),0 0 12px rgba(244,114,182,.15)}93%,100%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}}",
"@keyframes stepOn2{0%,48%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}54%,80%{box-shadow:0 0 0 2px rgba(212,165,116,.6),0 0 14px rgba(212,165,116,.25)}93%,100%{box-shadow:0 0 0 0 transparent,0 0 0 transparent}}",
"@keyframes symFill1{0%,14%{opacity:0;transform:scale(.5)}20%{opacity:1;transform:scale(1.15)}24%,80%{opacity:1;transform:scale(1)}93%,100%{opacity:0;transform:scale(1)}}",
"@keyframes symFill2{0%,36%{opacity:0;transform:scale(.5)}42%{opacity:1;transform:scale(1.15)}46%,80%{opacity:1;transform:scale(1)}93%,100%{opacity:0;transform:scale(1)}}",
"@keyframes labelOn0{0%,5%{color:var(--tx3);text-shadow:none}10%,80%{color:var(--tx1);text-shadow:0 0 6px rgba(180,190,200,.2)}93%,100%{color:var(--tx3);text-shadow:none}}",
"@keyframes labelOn1{0%,24%{color:var(--tx3);text-shadow:none}30%,80%{color:var(--tx1);text-shadow:0 0 6px rgba(244,114,182,.2)}93%,100%{color:var(--tx3);text-shadow:none}}",
"@keyframes labelOn2{0%,48%{color:var(--tx3);text-shadow:none}54%,80%{color:var(--tx1);text-shadow:0 0 8px rgba(212,165,116,.25)}93%,100%{color:var(--tx3);text-shadow:none}}",
"@keyframes yumSparkle{0%,48%{filter:drop-shadow(0 0 0 transparent) drop-shadow(0 0 0 transparent)}54%{filter:drop-shadow(0 0 8px rgba(212,165,116,.4)) drop-shadow(0 0 18px rgba(212,165,116,.2))}60%,80%{filter:drop-shadow(0 0 14px rgba(212,165,116,.5)) drop-shadow(0 0 28px rgba(212,165,116,.2))}93%,100%{filter:drop-shadow(0 0 0 transparent) drop-shadow(0 0 0 transparent)}}",
".landingPulse{animation:ctaPulse 3s ease-in-out 2s infinite}",
"@keyframes ctaPulse{0%,100%{box-shadow:0 4px 20px rgba(244,114,182,.2)}50%{box-shadow:0 4px 30px rgba(244,114,182,.45)}}",
".slide-in{animation:slideIn .3s ease-out both}",
".tada{animation:tada .5s ease-out both}",
"button{touch-action:manipulation}","button:active{transform:scale(.97)}","button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}","input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--ac);outline-offset:2px}","div::-webkit-scrollbar{display:none}",
"input[type='range']{accent-color:var(--ac);width:100%}",
".jfl-overlay{position:fixed;inset:0;background:rgba(13,17,23,.95);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center}",
".jfl-cta{width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#F472B6,#C4956A);color:white;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;font-size:15px;font-weight:600;transition:transform .15s;text-shadow:0 1px 3px rgba(0,0,0,.25)}",
".jfl-cta:disabled{cursor:not-allowed;opacity:.35 !important;transform:none !important}",
".jfl-cta-hero{padding:18px 14px;border-radius:14px;box-shadow:0 2px 12px rgba(244,114,182,.2);animation:ctaGlow 3s ease-in-out infinite}",
"@keyframes ctaGlow{0%,100%{box-shadow:0 2px 12px rgba(244,114,182,.2)}50%{box-shadow:0 4px 22px rgba(244,114,182,.4),0 0 40px rgba(196,149,106,.12)}}",
"@keyframes floatIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}",
"@keyframes emojiScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}",
"@keyframes emojiFadeIn{0%{opacity:0}100%{opacity:1}}",
"@keyframes emojiSine0{0%,100%{transform:translateY(22px)}50%{transform:translateY(-44px)}}",
"@keyframes emojiSine1{0%,100%{transform:translateY(14px)}50%{transform:translateY(-28px)}}",
"@keyframes emojiSine2{0%,100%{transform:translateY(16px)}50%{transform:translateY(-36px)}}",
"@keyframes podiumPop{0%{opacity:0;transform:scale(.5) translateY(8px)}60%{opacity:1;transform:scale(1.1) translateY(-2px)}100%{transform:scale(1) translateY(0)}}",
".float-in{animation:floatIn .4s ease-out both}",
".podium-pop{animation:podiumPop .4s ease-out both}",
".jfl-btn{padding:10px 16px;border:1px solid var(--bdr);border-radius:10px;background:var(--bg1);color:var(--tx2);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s}",
".jfl-btn:hover{border-color:var(--ac)}",
".jfl-btn:active{transform:scale(.97)}",
".jfl-card{background:var(--bg1);border-radius:12px;padding:14px;border:1px solid var(--bdr)}",
".jfl-label{font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:1px}",
".jfl-stat{background:var(--bg1);border-radius:10px;padding:14px 10px;border:1px solid var(--bdr);text-align:center;cursor:pointer;font-family:inherit;transition:border-color .15s}",
".jfl-stat:active{border-color:var(--ac)}",
".jfl-stat-n{font-size:20px;font-weight:700;color:var(--tx1)}",
".jfl-stat-l{font-size:12px;font-weight:600;color:var(--tx2);margin-top:4px}",
".jfl-chip{display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:10px;border:1px solid var(--bdr);background:var(--bg1);cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:var(--tx2);transition:all .12s}",
".jfl-chip:hover{border-color:var(--ac);background:var(--bg2)}",
".jfl-chip:active{animation:chipBounce .15s ease-out}",
".jfl-chip.on{border-color:var(--ac);background:var(--bg2);color:var(--ac)}",
".jfl-pill{padding:7px 12px;border-radius:20px;border:1px solid var(--bdr);background:var(--bg1);color:var(--tx2);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s}",
".jfl-pill:hover:not(.on){border-color:var(--ac)}",
".jfl-pill.on{border-color:var(--ac);background:var(--ac);color:white;text-shadow:0 1px 2px rgba(0,0,0,.25)}",
".jfl-mc{padding:6px 14px;border-radius:8px;border:1px solid var(--bdr);background:var(--bg1);color:var(--tx2);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .1s}",
".jfl-mc.on{border-color:var(--ac);background:var(--ac);color:white}",
".jfl-footer{font-size:11px;color:var(--tx3);font-weight:500}",
"@media(min-width:600px){.jfl-root{max-width:600px}.jfl-cta{font-size:17px;padding:14px}.jfl-cta-hero{padding:22px 16px}.jfl-btn{font-size:15px;padding:12px 18px}.jfl-card{padding:16px}.jfl-chip{font-size:15px;padding:13px 16px}.jfl-pill{font-size:15px;padding:9px 16px}.jfl-stat{padding:16px 12px}.jfl-stat-n{font-size:22px}.jfl-stat-l{font-size:14px}.jfl-label{font-size:13px}}",
"@media(prefers-reduced-motion:reduce){.fade,.pop,.tada,.float-in,.podium-pop,.stagger-1,.stagger-2,.stagger-3,.slot-roll,.spin,.landingPulse,.chipBounce,.slide-in{animation:none !important}.jfl-cta-hero,.insightsShimmer,.crown-glow{animation:none !important}[style*=\"animation\"]{animation:none !important}*{transition:none !important}}",
].join("\n");
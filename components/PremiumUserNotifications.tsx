"use client";

import { useEffect, useState, useCallback } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
}

const FALLBACK_USERS: User[] = [
  {
    "id": "real-0",
    "name": "Vaishnavi Swami"
  },
  {
    "id": "real-1",
    "name": "Invincible0412"
  },
  {
    "id": "real-2",
    "name": "Pruthviraj Gaikwed"
  },
  {
    "id": "real-3",
    "name": "Shivani Boinwad"
  },
  {
    "id": "real-4",
    "name": "Aniket Chavan"
  },
  {
    "id": "real-5",
    "name": "YASHRAJ BABHALE"
  },
  {
    "id": "real-6",
    "name": "Advay Saraf"
  },
  {
    "id": "real-7",
    "name": "Yash Gulhane"
  },
  {
    "id": "real-8",
    "name": "Nikhil Khaire"
  },
  {
    "id": "real-9",
    "name": "Purva Thakare"
  },
  {
    "id": "real-10",
    "name": "pranav shimpi"
  },
  {
    "id": "real-11",
    "name": "Swanand Patil"
  },
  {
    "id": "real-12",
    "name": "Snehal Bhand"
  },
  {
    "id": "real-13",
    "name": "Mansi Nangliya"
  },
  {
    "id": "real-14",
    "name": "Aditi Avhad"
  },
  {
    "id": "real-15",
    "name": "Mg b"
  },
  {
    "id": "real-16",
    "name": "Bhakti Khatavkar"
  },
  {
    "id": "real-17",
    "name": "Sujata Rathod"
  },
  {
    "id": "real-18",
    "name": "Om Shingade"
  },
  {
    "id": "real-19",
    "name": "Sagar"
  },
  {
    "id": "real-20",
    "name": "Praharsh Patil"
  },
  {
    "id": "real-21",
    "name": "Laxman phulari"
  },
  {
    "id": "real-22",
    "name": "Tiny_mayor"
  },
  {
    "id": "real-23",
    "name": "Riddhi Sardesai"
  },
  {
    "id": "real-24",
    "name": "Samiksha Narhare"
  },
  {
    "id": "real-25",
    "name": "Panchami Gujar"
  },
  {
    "id": "real-26",
    "name": "Hemang Rajput"
  },
  {
    "id": "real-27",
    "name": "29.janhavi Katgaonkar"
  },
  {
    "id": "real-28",
    "name": "San Nitro"
  },
  {
    "id": "real-29",
    "name": "PALLAVI DONGARE"
  },
  {
    "id": "real-30",
    "name": "Pratik"
  },
  {
    "id": "real-31",
    "name": "Amruta Kulkarni"
  },
  {
    "id": "real-32",
    "name": "Bhagyashriii Ubale"
  },
  {
    "id": "real-33",
    "name": "Yash"
  },
  {
    "id": "real-34",
    "name": "dhanashri aher"
  },
  {
    "id": "real-35",
    "name": "Sanika Yewale"
  },
  {
    "id": "real-36",
    "name": "Vivek Narawade"
  },
  {
    "id": "real-37",
    "name": "Pranita Panchal"
  },
  {
    "id": "real-38",
    "name": "Diksha Mate"
  },
  {
    "id": "real-39",
    "name": "Srushti Kalyanshetti"
  },
  {
    "id": "real-40",
    "name": "Nidhi Ajmera"
  },
  {
    "id": "real-41",
    "name": "Vinay Kawale"
  },
  {
    "id": "real-42",
    "name": "Khatale Sakshi"
  },
  {
    "id": "real-43",
    "name": "M.R. MONSTR"
  },
  {
    "id": "real-44",
    "name": "Gauravi Marne"
  },
  {
    "id": "real-45",
    "name": "Saloni Kedar"
  },
  {
    "id": "real-46",
    "name": "Guru Chavan"
  },
  {
    "id": "real-47",
    "name": "Archit Deorukhakar"
  },
  {
    "id": "real-48",
    "name": "Rohit Padwal"
  },
  {
    "id": "real-49",
    "name": "Nihal Tamboli"
  },
  {
    "id": "real-50",
    "name": "Fake Acc"
  },
  {
    "id": "real-51",
    "name": "Satyam Gole"
  },
  {
    "id": "real-52",
    "name": "Tiya Sontakke"
  },
  {
    "id": "real-53",
    "name": "Gaurav Sonpasare"
  },
  {
    "id": "real-54",
    "name": "Raj Sonawane"
  },
  {
    "id": "real-55",
    "name": "Ayush Nale"
  },
  {
    "id": "real-56",
    "name": "Anuj Bathiya"
  },
  {
    "id": "real-57",
    "name": "shubham space"
  },
  {
    "id": "real-58",
    "name": "Mansvi Shinde"
  },
  {
    "id": "real-59",
    "name": "Mayuri Shindalkar"
  },
  {
    "id": "real-60",
    "name": "Prajakta Bhambar"
  },
  {
    "id": "real-61",
    "name": "Mansi Kurkute"
  },
  {
    "id": "real-62",
    "name": "Disha"
  },
  {
    "id": "real-63",
    "name": "aniket"
  },
  {
    "id": "real-64",
    "name": "Shruti Samshette"
  },
  {
    "id": "real-65",
    "name": "Kalyani Patil"
  },
  {
    "id": "real-66",
    "name": "shreekrishna chinta"
  },
  {
    "id": "real-67",
    "name": "Khushi Nanekar"
  },
  {
    "id": "real-68",
    "name": "Tanushri Jadhav"
  },
  {
    "id": "real-69",
    "name": "Ishwari Jagtap"
  },
  {
    "id": "real-70",
    "name": "Sanika Raut"
  },
  {
    "id": "real-71",
    "name": "Mayur Game a/c"
  },
  {
    "id": "real-72",
    "name": "Suraj Dhengle Patil"
  },
  {
    "id": "real-73",
    "name": "Dhananjayke Kesare"
  },
  {
    "id": "real-74",
    "name": "Divya Bharti"
  },
  {
    "id": "real-75",
    "name": "Shrutii"
  },
  {
    "id": "real-76",
    "name": "Rutu Honrao"
  },
  {
    "id": "real-77",
    "name": "Prathmesh Gayake"
  },
  {
    "id": "real-78",
    "name": "Pawan Shivaji ghule"
  },
  {
    "id": "real-79",
    "name": "Siddh Chavare"
  },
  {
    "id": "real-80",
    "name": "Bhushan Jadhav"
  },
  {
    "id": "real-81",
    "name": "Sneha Mahajan"
  },
  {
    "id": "real-82",
    "name": "Manoj Rama Kolekar"
  },
  {
    "id": "real-83",
    "name": "Vaishnavi Gaidhane"
  },
  {
    "id": "real-84",
    "name": "Sarthak Gunjal"
  },
  {
    "id": "real-85",
    "name": "PHP SIKHUNGA"
  },
  {
    "id": "real-86",
    "name": "Shriraj Patil"
  },
  {
    "id": "real-87",
    "name": "Yugandhaar Savalajkar"
  },
  {
    "id": "real-88",
    "name": "Kaustubh Surya"
  },
  {
    "id": "real-89",
    "name": "Pratiksha Sapkale"
  },
  {
    "id": "real-90",
    "name": "Samarth Chaudhari"
  },
  {
    "id": "real-91",
    "name": "Vaishnavi Mathpati"
  },
  {
    "id": "real-92",
    "name": "Dhiraj Yargatwar"
  },
  {
    "id": "real-93",
    "name": "Arati Tekale"
  },
  {
    "id": "real-94",
    "name": "Elisha Hayford"
  },
  {
    "id": "real-95",
    "name": "Sanika Paul"
  },
  {
    "id": "real-96",
    "name": "PM Akkanawaru"
  },
  {
    "id": "real-97",
    "name": "Atharva Savji"
  },
  {
    "id": "real-98",
    "name": "Neel Patil"
  },
  {
    "id": "real-99",
    "name": "Shyam Shinde"
  },
  {
    "id": "real-100",
    "name": "32_Janhavi Marathe"
  },
  {
    "id": "real-101",
    "name": "Mohit sanjay pujari"
  },
  {
    "id": "real-102",
    "name": "Anupam Bose"
  },
  {
    "id": "real-103",
    "name": "Janhavi Gunjal"
  },
  {
    "id": "real-104",
    "name": "Shambhavi Todkare"
  },
  {
    "id": "real-105",
    "name": "Jui Deshmukh"
  },
  {
    "id": "real-106",
    "name": "Suyash Chavan"
  },
  {
    "id": "real-107",
    "name": "YASH TAKAWALE"
  },
  {
    "id": "real-108",
    "name": "Ruturaj Shinde"
  },
  {
    "id": "real-109",
    "name": "Shlok Parge"
  },
  {
    "id": "real-110",
    "name": "Its me Devil"
  },
  {
    "id": "real-111",
    "name": "Shubhangi Yajgar"
  },
  {
    "id": "real-112",
    "name": "Mr. College"
  },
  {
    "id": "real-113",
    "name": "Praniti Kamble"
  },
  {
    "id": "real-114",
    "name": "Vaishnavi Kamble"
  },
  {
    "id": "real-115",
    "name": "Gunmanjiri Bagade"
  },
  {
    "id": "real-116",
    "name": "Chetan Gosavi"
  },
  {
    "id": "real-117",
    "name": "Sneha Sable"
  },
  {
    "id": "real-118",
    "name": "Gayatri Chandane"
  },
  {
    "id": "real-119",
    "name": "Shravani"
  },
  {
    "id": "real-120",
    "name": "Shubham Jivane"
  },
  {
    "id": "real-121",
    "name": "Priya Sirsat"
  },
  {
    "id": "real-122",
    "name": "Pranav Patil"
  },
  {
    "id": "real-123",
    "name": "Pranita Patil"
  },
  {
    "id": "real-124",
    "name": "Mohit Kankhare"
  },
  {
    "id": "real-125",
    "name": "Shivkanya"
  },
  {
    "id": "real-126",
    "name": "Anjali Halke"
  },
  {
    "id": "real-127",
    "name": "AUTO GEAR"
  },
  {
    "id": "real-128",
    "name": "Hardik Gawande"
  },
  {
    "id": "real-129",
    "name": "shreyash bhujbal"
  },
  {
    "id": "real-130",
    "name": "Himanshu Gond"
  },
  {
    "id": "real-131",
    "name": "Pratiksha Sarvade"
  },
  {
    "id": "real-132",
    "name": "Y_A_S_H_"
  },
  {
    "id": "real-133",
    "name": "Sahil Thombre"
  },
  {
    "id": "real-134",
    "name": "Tanvi Dhokane"
  },
  {
    "id": "real-135",
    "name": "Tejas kankhare"
  },
  {
    "id": "real-136",
    "name": "Bhakti vikhe"
  },
  {
    "id": "real-137",
    "name": "Saniya Patil"
  },
  {
    "id": "real-138",
    "name": "Harshavardhan Patil"
  },
  {
    "id": "real-139",
    "name": "Karan Sandip Toke"
  },
  {
    "id": "real-140",
    "name": "Anandi Pachange"
  },
  {
    "id": "real-141",
    "name": "Shital Limhan"
  },
  {
    "id": "real-142",
    "name": "Danish Patel"
  },
  {
    "id": "real-143",
    "name": "Pawanraj Kurund"
  },
  {
    "id": "real-144",
    "name": "Shravani devkar"
  },
  {
    "id": "real-145",
    "name": "EEA Chaudhari Anjali Prashant Chaudhari"
  },
  {
    "id": "real-146",
    "name": "Suhani"
  },
  {
    "id": "real-147",
    "name": "Shubhangi Rawool"
  },
  {
    "id": "real-148",
    "name": "Ankit Jain"
  },
  {
    "id": "real-149",
    "name": "Rohit Gore"
  },
  {
    "id": "real-150",
    "name": "Piyush Rathod"
  },
  {
    "id": "real-151",
    "name": "Blog Hustler"
  },
  {
    "id": "real-152",
    "name": "anushka jadhav"
  },
  {
    "id": "real-153",
    "name": "Vedika Manjunath gurjar"
  },
  {
    "id": "real-154",
    "name": "Usman"
  },
  {
    "id": "real-155",
    "name": "Sayali Gudle"
  },
  {
    "id": "real-156",
    "name": "Sujal Baburao Pokharkar"
  },
  {
    "id": "real-157",
    "name": "Vishal Narayankar"
  },
  {
    "id": "real-158",
    "name": "Ajinkya. Deore"
  },
  {
    "id": "real-159",
    "name": "Bhushan Avhad"
  },
  {
    "id": "real-160",
    "name": "Mr.Hacker"
  },
  {
    "id": "real-161",
    "name": "vaishnavi kharge"
  },
  {
    "id": "real-162",
    "name": "Meet Shah"
  },
  {
    "id": "real-163",
    "name": "Vaishnavi Pawar"
  },
  {
    "id": "real-164",
    "name": "Spider Man"
  },
  {
    "id": "real-165",
    "name": "Sagar Kesare"
  },
  {
    "id": "real-166",
    "name": "Om Pawar"
  },
  {
    "id": "real-167",
    "name": "devsh"
  },
  {
    "id": "real-168",
    "name": "Vijay Jadhav"
  },
  {
    "id": "real-169",
    "name": "WALTER White"
  },
  {
    "id": "real-170",
    "name": "Amar Kale"
  },
  {
    "id": "real-171",
    "name": "Sarvesh Bhosale"
  },
  {
    "id": "real-172",
    "name": "Santosh More"
  },
  {
    "id": "real-173",
    "name": "Sagar Kharat"
  },
  {
    "id": "real-174",
    "name": "Sahil"
  },
  {
    "id": "real-175",
    "name": "Janhavi Chavan"
  },
  {
    "id": "real-176",
    "name": "Om Wakchaure"
  },
  {
    "id": "real-177",
    "name": "Samarth Mishra"
  },
  {
    "id": "real-178",
    "name": "NIMU DOFE"
  },
  {
    "id": "real-179",
    "name": "Pravin Shirole"
  },
  {
    "id": "real-180",
    "name": "rohan jadhav"
  },
  {
    "id": "real-181",
    "name": "Kalyan padole"
  },
  {
    "id": "real-182",
    "name": "new"
  },
  {
    "id": "real-183",
    "name": "Sakshi Gavhane"
  },
  {
    "id": "real-184",
    "name": "Supriya Mulik"
  },
  {
    "id": "real-185",
    "name": "Pratiksha Harne"
  },
  {
    "id": "real-186",
    "name": "Nityashree Choudhary"
  },
  {
    "id": "real-187",
    "name": "Vedika Gurjar"
  },
  {
    "id": "real-188",
    "name": "Aditi Baste"
  },
  {
    "id": "real-189",
    "name": "Trishul Gawande"
  },
  {
    "id": "real-190",
    "name": "Shravani Deshmukh"
  },
  {
    "id": "real-191",
    "name": "Shubham Suryawanshi"
  },
  {
    "id": "real-192",
    "name": "Abhi Bhombe"
  },
  {
    "id": "real-193",
    "name": "Rutuja Gadhave"
  },
  {
    "id": "real-194",
    "name": "Tina Bhutada"
  },
  {
    "id": "real-195",
    "name": "Prem Soma"
  },
  {
    "id": "real-196",
    "name": "Shivani"
  },
  {
    "id": "real-197",
    "name": "Aishwarya"
  },
  {
    "id": "real-198",
    "name": "Aarti Bhagwat"
  },
  {
    "id": "real-199",
    "name": "Sakshi Wagh"
  },
  {
    "id": "real-200",
    "name": "Ghananil Shirpurkar"
  },
  {
    "id": "real-201",
    "name": "Anuj Vijay Mhatre"
  },
  {
    "id": "real-202",
    "name": "Olivier Muhire"
  },
  {
    "id": "real-203",
    "name": "Vipul Rathod"
  },
  {
    "id": "real-204",
    "name": "Anagha Wani"
  },
  {
    "id": "real-205",
    "name": "Sanidhya Charbare"
  },
  {
    "id": "real-206",
    "name": "Siddharam dayanand lachyane"
  },
  {
    "id": "real-207",
    "name": "Omkar Jagtap"
  },
  {
    "id": "real-208",
    "name": "Aditi Shid"
  },
  {
    "id": "real-209",
    "name": "Sakshi Barse"
  },
  {
    "id": "real-210",
    "name": "Aditya Bhandari"
  },
  {
    "id": "real-211",
    "name": "Rushab Nhivekar"
  },
  {
    "id": "real-212",
    "name": "Sanika Thorave"
  },
  {
    "id": "real-213",
    "name": "Piyusha Fasake"
  },
  {
    "id": "real-214",
    "name": "Nayan Khot"
  },
  {
    "id": "real-215",
    "name": "Janhavi Pawar"
  },
  {
    "id": "real-216",
    "name": "Rajvardhan Sidanale"
  },
  {
    "id": "real-217",
    "name": "Shaikh Abdul Rahman"
  },
  {
    "id": "real-218",
    "name": "Muskan Gupta"
  },
  {
    "id": "real-219",
    "name": "Aayush"
  },
  {
    "id": "real-220",
    "name": "Haxm"
  },
  {
    "id": "real-221",
    "name": "Sujal Ghadage"
  },
  {
    "id": "real-222",
    "name": "Padmavati Suryawanshi"
  },
  {
    "id": "real-223",
    "name": "Prajwal"
  },
  {
    "id": "real-224",
    "name": "Mahindrakar Prachi Deepakrao"
  },
  {
    "id": "real-225",
    "name": "sunita Parve"
  },
  {
    "id": "real-226",
    "name": "Pallavi Havre"
  },
  {
    "id": "real-227",
    "name": "Rohan Agale"
  },
  {
    "id": "real-228",
    "name": "Prasad Thikekar"
  },
  {
    "id": "real-229",
    "name": "Mansi Alshi"
  },
  {
    "id": "real-230",
    "name": "Atharva Magare"
  },
  {
    "id": "real-231",
    "name": "Malhar Sadavarte"
  },
  {
    "id": "real-232",
    "name": "Siddhi Chavan"
  },
  {
    "id": "real-233",
    "name": "Harshal Landge"
  },
  {
    "id": "real-234",
    "name": "Mohit Pramod Mahajan"
  },
  {
    "id": "real-235",
    "name": "Shreyash Nilje"
  },
  {
    "id": "real-236",
    "name": "ankush Jagdale"
  },
  {
    "id": "real-237",
    "name": "Ravikiran Tirgule"
  },
  {
    "id": "real-238",
    "name": "chaitanya Navarange"
  },
  {
    "id": "real-239",
    "name": "47 Sharvari Rase"
  },
  {
    "id": "real-240",
    "name": "Sakshi Salunkhe"
  },
  {
    "id": "real-241",
    "name": "manish chavan"
  },
  {
    "id": "real-242",
    "name": "Shruti Sonar"
  },
  {
    "id": "real-243",
    "name": "Samiksha Dhole"
  },
  {
    "id": "real-244",
    "name": "Priya Karle"
  },
  {
    "id": "real-245",
    "name": "Kunal"
  },
  {
    "id": "real-246",
    "name": "DSR"
  },
  {
    "id": "real-247",
    "name": "Sakshi Dixit"
  },
  {
    "id": "real-248",
    "name": "Shreyas Jadhav"
  },
  {
    "id": "real-249",
    "name": "Pranjali Bhagole"
  },
  {
    "id": "real-250",
    "name": "Anushka Hanwate"
  },
  {
    "id": "real-251",
    "name": "It's me SVS"
  },
  {
    "id": "real-252",
    "name": "Purva Shinde"
  },
  {
    "id": "real-253",
    "name": "Pratham Kadam"
  },
  {
    "id": "real-254",
    "name": "Vedant Muttha"
  },
  {
    "id": "real-255",
    "name": "Parishnav"
  },
  {
    "id": "real-256",
    "name": "Vedant"
  },
  {
    "id": "real-257",
    "name": "Sharayu"
  },
  {
    "id": "real-258",
    "name": "Samir Deshmane"
  },
  {
    "id": "real-259",
    "name": "SAMARTH AWARE"
  },
  {
    "id": "real-260",
    "name": "Kunal More"
  },
  {
    "id": "real-261",
    "name": "MAYUR SUTKAR"
  },
  {
    "id": "real-262",
    "name": "Pavan Aware"
  },
  {
    "id": "real-263",
    "name": "Swapnil Gundre"
  },
  {
    "id": "real-264",
    "name": "Pratham Shelar"
  },
  {
    "id": "real-265",
    "name": "Akanksha Farakte"
  },
  {
    "id": "real-266",
    "name": "Pradip More"
  },
  {
    "id": "real-267",
    "name": "Purva Bhakare"
  },
  {
    "id": "real-268",
    "name": "Sanika Chougale"
  },
  {
    "id": "real-269",
    "name": "Dhammashila Zagade"
  },
  {
    "id": "real-270",
    "name": "Arya Kadam"
  },
  {
    "id": "real-271",
    "name": "Rohit _Mahato"
  },
  {
    "id": "real-272",
    "name": "Vaishnavi Kelkar"
  },
  {
    "id": "real-273",
    "name": "Sangram"
  },
  {
    "id": "real-274",
    "name": "Bobby Singh"
  },
  {
    "id": "real-275",
    "name": "supriya kandhare"
  },
  {
    "id": "real-276",
    "name": "Om Gaikwad"
  },
  {
    "id": "real-277",
    "name": "Gauri Bhakare"
  },
  {
    "id": "real-278",
    "name": "Sakshi Vavale"
  },
  {
    "id": "real-279",
    "name": "Vaibhav Sathe"
  },
  {
    "id": "real-280",
    "name": "Sanket Sawant"
  },
  {
    "id": "real-281",
    "name": "SHRUTIKA DESHPANDE"
  },
  {
    "id": "real-282",
    "name": "Pratiksha Tarange"
  },
  {
    "id": "real-283",
    "name": "Sakshi Jadhav"
  },
  {
    "id": "real-284",
    "name": "Sanika Sawant"
  },
  {
    "id": "real-285",
    "name": "Vaishnavi"
  },
  {
    "id": "real-286",
    "name": "Fake 1"
  },
  {
    "id": "real-287",
    "name": "Sakshi Gitte"
  },
  {
    "id": "real-288",
    "name": "Naman Mehta"
  },
  {
    "id": "real-289",
    "name": "Rajani Khairnar"
  },
  {
    "id": "real-290",
    "name": "Sibl Heel"
  },
  {
    "id": "real-291",
    "name": "VIKAS PATIL"
  },
  {
    "id": "real-292",
    "name": "SAKSHI MALI"
  },
  {
    "id": "real-293",
    "name": "Rupesh Patil"
  },
  {
    "id": "real-294",
    "name": "Prachit Save"
  },
  {
    "id": "real-295",
    "name": "Sanket Gore"
  },
  {
    "id": "real-296",
    "name": "Shubham Birajdar"
  },
  {
    "id": "real-297",
    "name": "MuKesh"
  },
  {
    "id": "real-298",
    "name": "Kaustubh Nagavekar"
  },
  {
    "id": "real-299",
    "name": "Sanchita Salunkhe"
  },
  {
    "id": "real-300",
    "name": "Dhruv Yelbhar"
  },
  {
    "id": "real-301",
    "name": "Shreya Gurav"
  },
  {
    "id": "real-302",
    "name": "Ayush Bachhav"
  },
  {
    "id": "real-303",
    "name": "Satyajit Divate"
  },
  {
    "id": "real-304",
    "name": "Mamta Kondamgire"
  },
  {
    "id": "real-305",
    "name": "Dnyaneshwari Gayake"
  },
  {
    "id": "real-306",
    "name": "Om Battul"
  },
  {
    "id": "real-307",
    "name": "Malhar Kulkarni"
  },
  {
    "id": "real-308",
    "name": "Supriya Bachpalle"
  },
  {
    "id": "real-309",
    "name": "Sontakke Kiran"
  },
  {
    "id": "real-310",
    "name": "White Devil"
  },
  {
    "id": "real-311",
    "name": "Ganesh Ghumare"
  },
  {
    "id": "real-312",
    "name": "abhishek alande"
  },
  {
    "id": "real-313",
    "name": "Shivani Dhotre"
  },
  {
    "id": "real-314",
    "name": "JAWAD ALI HAQQANI"
  },
  {
    "id": "real-315",
    "name": "Vivek Vidhate"
  },
  {
    "id": "real-316",
    "name": "Sanket Berkile"
  },
  {
    "id": "real-317",
    "name": "alextp"
  },
  {
    "id": "real-318",
    "name": "Rutuja Sajjanshette"
  },
  {
    "id": "real-319",
    "name": "Sujit Jadhav"
  },
  {
    "id": "real-320",
    "name": "Ishwari Surve"
  },
  {
    "id": "real-321",
    "name": "Yash Patil"
  },
  {
    "id": "real-322",
    "name": "Faaa"
  },
  {
    "id": "real-323",
    "name": "Dhanshree Jagtap"
  },
  {
    "id": "real-324",
    "name": "Aditya Bubane"
  },
  {
    "id": "real-325",
    "name": "Prathamesh Deshmukh"
  },
  {
    "id": "real-326",
    "name": "Payal Rajesh Mandlik"
  },
  {
    "id": "real-327",
    "name": "Rutuja Salunke"
  },
  {
    "id": "real-328",
    "name": "Bhavna Suryawanshi"
  },
  {
    "id": "real-329",
    "name": "Gayatri Swami"
  },
  {
    "id": "real-330",
    "name": "Shubham Havale"
  },
  {
    "id": "real-331",
    "name": "Manas patale"
  },
  {
    "id": "real-332",
    "name": "Yashodip Jadhav"
  },
  {
    "id": "real-333",
    "name": "Diksha Solaskar"
  },
  {
    "id": "real-334",
    "name": "FUZAIL WASTA"
  },
  {
    "id": "real-335",
    "name": "Rajveer Kadam"
  },
  {
    "id": "real-336",
    "name": "Yash Khobare"
  },
  {
    "id": "real-337",
    "name": "Monika Dhage"
  },
  {
    "id": "real-338",
    "name": "Stephan Mak"
  },
  {
    "id": "real-339",
    "name": "Poonam"
  },
  {
    "id": "real-340",
    "name": "Devashish Mundada"
  },
  {
    "id": "real-341",
    "name": "Pranil Tamgadge"
  },
  {
    "id": "real-342",
    "name": "RJ Insta"
  },
  {
    "id": "real-343",
    "name": "26.Vaishnavi Jaybhaye"
  },
  {
    "id": "real-344",
    "name": "pranav jawak"
  },
  {
    "id": "real-345",
    "name": "suyash Ghodake"
  },
  {
    "id": "real-346",
    "name": "Sujal Upare"
  },
  {
    "id": "real-347",
    "name": "Lokesh Chaudhari"
  },
  {
    "id": "real-348",
    "name": "Aryan Patil"
  },
  {
    "id": "real-349",
    "name": "Bhakti"
  },
  {
    "id": "real-350",
    "name": "Samruddhi More"
  },
  {
    "id": "real-351",
    "name": "Rutuja shinde"
  },
  {
    "id": "real-352",
    "name": "arjun bhingole"
  },
  {
    "id": "real-353",
    "name": "Shiva Mahadevan"
  },
  {
    "id": "real-354",
    "name": "Nisha Gaikwad"
  },
  {
    "id": "real-355",
    "name": "Sarthak Nikam"
  },
  {
    "id": "real-356",
    "name": "Mukesh Bhoi"
  },
  {
    "id": "real-357",
    "name": "Gaurav Gaming"
  },
  {
    "id": "real-358",
    "name": "Sahil Gangurde"
  },
  {
    "id": "real-359",
    "name": "Dipasha Mahajan"
  },
  {
    "id": "real-360",
    "name": "Khushi Kharche"
  },
  {
    "id": "real-361",
    "name": "Sakshi Kodale"
  },
  {
    "id": "real-362",
    "name": "Vivek Kuril"
  },
  {
    "id": "real-363",
    "name": "Shrushti Shingade"
  },
  {
    "id": "real-364",
    "name": "Venkatesh Chidrawar"
  },
  {
    "id": "real-365",
    "name": "Yogesh Yemul"
  },
  {
    "id": "real-366",
    "name": "Swagat Patil"
  },
  {
    "id": "real-367",
    "name": "Samrudhi Kakade"
  },
  {
    "id": "real-368",
    "name": "met bkc"
  },
  {
    "id": "real-369",
    "name": "Shraddha Rajurkar"
  },
  {
    "id": "real-370",
    "name": "Om Jadhav"
  },
  {
    "id": "real-371",
    "name": "SADate"
  },
  {
    "id": "real-372",
    "name": "rwltza"
  },
  {
    "id": "real-373",
    "name": "Sakshi Khairnar"
  },
  {
    "id": "real-374",
    "name": "Pooja Sarphale"
  },
  {
    "id": "real-375",
    "name": "Mayur Gole"
  },
  {
    "id": "real-376",
    "name": "virendra Sonawane"
  },
  {
    "id": "real-377",
    "name": "Rupesh Mahire"
  },
  {
    "id": "real-378",
    "name": "Roshani Saste"
  },
  {
    "id": "real-379",
    "name": "Satyam Patil"
  },
  {
    "id": "real-380",
    "name": "Komal Jadhav"
  },
  {
    "id": "real-381",
    "name": "Jagruti Chouhan"
  },
  {
    "id": "real-382",
    "name": "Ishita Pate"
  },
  {
    "id": "real-383",
    "name": "Vikas Munjale"
  },
  {
    "id": "real-384",
    "name": "Avantika Jadhav"
  },
  {
    "id": "real-385",
    "name": "Gayatri Deore"
  },
  {
    "id": "real-386",
    "name": "Moreshwar Patil"
  },
  {
    "id": "real-387",
    "name": "Ayush"
  },
  {
    "id": "real-388",
    "name": "Prajwal. S.S"
  },
  {
    "id": "real-389",
    "name": "Apex"
  },
  {
    "id": "real-390",
    "name": "Aarti Bhise"
  },
  {
    "id": "real-391",
    "name": "Ram Rajput"
  },
  {
    "id": "real-392",
    "name": "srushti shinde"
  },
  {
    "id": "real-393",
    "name": "Anjali Gawali"
  },
  {
    "id": "real-394",
    "name": "Shreyash Hucche"
  },
  {
    "id": "real-395",
    "name": "Shubham Rathod"
  },
  {
    "id": "real-396",
    "name": "Lajari Waghmare"
  },
  {
    "id": "real-397",
    "name": "Sakshi Sarolkar"
  },
  {
    "id": "real-398",
    "name": "Kamble Pranjali Kalidas"
  },
  {
    "id": "real-399",
    "name": "Siddhi Bolaikar"
  },
  {
    "id": "real-400",
    "name": "Shubham Pagare"
  },
  {
    "id": "real-401",
    "name": "Baby Edits"
  },
  {
    "id": "real-402",
    "name": "Vighnesh Joshi"
  },
  {
    "id": "real-403",
    "name": "Swamini Jadhav"
  },
  {
    "id": "real-404",
    "name": "54. Yash islampure"
  },
  {
    "id": "real-405",
    "name": "Shivam Dushman"
  },
  {
    "id": "real-406",
    "name": "Chinmay Koparde"
  },
  {
    "id": "real-407",
    "name": "Radha Samadhan Yadav"
  },
  {
    "id": "real-408",
    "name": "disha kadukar"
  },
  {
    "id": "real-409",
    "name": "Nadarge Rutuja Ramesh"
  },
  {
    "id": "real-410",
    "name": "Sahil Dolas"
  },
  {
    "id": "real-411",
    "name": "Jayesh Haribhau More"
  },
  {
    "id": "real-412",
    "name": "shubham pagare"
  },
  {
    "id": "real-413",
    "name": "Shravan Sanjiv Jdhav"
  },
  {
    "id": "real-414",
    "name": "Arpita"
  },
  {
    "id": "real-415",
    "name": "Isha Chaniyara"
  },
  {
    "id": "real-416",
    "name": "Kunal Jadhav"
  },
  {
    "id": "real-417",
    "name": "46 Pranay Hajare"
  },
  {
    "id": "real-418",
    "name": "VANSH TARPE"
  },
  {
    "id": "real-419",
    "name": "48-Sahil Chavhan"
  },
  {
    "id": "real-420",
    "name": "Madguy"
  },
  {
    "id": "real-421",
    "name": "Anushka Lande"
  },
  {
    "id": "real-422",
    "name": "ZORX"
  },
  {
    "id": "real-423",
    "name": "Sayali Mane"
  },
  {
    "id": "real-424",
    "name": "Nurav Kadam"
  },
  {
    "id": "real-425",
    "name": "Nupur Kachare"
  },
  {
    "id": "real-426",
    "name": "Atharva Chavan"
  },
  {
    "id": "real-427",
    "name": "Shravani Joshi"
  },
  {
    "id": "real-428",
    "name": "snehal patil"
  },
  {
    "id": "real-429",
    "name": "Kadam Patil"
  },
  {
    "id": "real-430",
    "name": "Affan"
  },
  {
    "id": "real-431",
    "name": "siddhi"
  },
  {
    "id": "real-432",
    "name": "Siddhant chougule"
  },
  {
    "id": "real-433",
    "name": "Jack Sparrow"
  },
  {
    "id": "real-434",
    "name": "Samprada Hiremath"
  },
  {
    "id": "real-435",
    "name": "Sarvesh Londhe"
  },
  {
    "id": "real-436",
    "name": "vishwajit kadam"
  },
  {
    "id": "real-437",
    "name": "Rushi Jare"
  },
  {
    "id": "real-438",
    "name": "604 More prasad"
  },
  {
    "id": "real-439",
    "name": "Harshada Bhakare"
  },
  {
    "id": "real-440",
    "name": "Gourav Sawant"
  },
  {
    "id": "real-441",
    "name": "Monika biradar"
  },
  {
    "id": "real-442",
    "name": "Anushka Mane"
  },
  {
    "id": "real-443",
    "name": "Shravani Ghadigaonkar"
  },
  {
    "id": "real-444",
    "name": "Shraddha Wayal"
  },
  {
    "id": "real-445",
    "name": "Shardul Wable"
  },
  {
    "id": "real-446",
    "name": "Sharayu Kaile"
  },
  {
    "id": "real-447",
    "name": "Sachin Nitin Patil"
  },
  {
    "id": "real-448",
    "name": "AMARJEET SHINDE"
  },
  {
    "id": "real-449",
    "name": "Sahil Bansode"
  },
  {
    "id": "real-450",
    "name": "Namita Yargatwar"
  },
  {
    "id": "real-451",
    "name": "Aarti"
  },
  {
    "id": "real-452",
    "name": "Baliram Surwase"
  },
  {
    "id": "real-453",
    "name": "Abhishek Waghmare"
  },
  {
    "id": "real-454",
    "name": "manoj kumar yadav"
  },
  {
    "id": "real-455",
    "name": "Sumit Ghate"
  },
  {
    "id": "real-456",
    "name": "Chaitali Mahale"
  },
  {
    "id": "real-457",
    "name": "Abdul Quadeer"
  },
  {
    "id": "real-458",
    "name": "Rohit Jawale"
  },
  {
    "id": "real-459",
    "name": "Dada Chormule"
  },
  {
    "id": "real-460",
    "name": "Pranav Sharma"
  },
  {
    "id": "real-461",
    "name": "Sai More"
  },
  {
    "id": "real-462",
    "name": "Omkar Deshmukh"
  },
  {
    "id": "real-463",
    "name": "Ronit Madage"
  },
  {
    "id": "real-464",
    "name": "Ayesha"
  },
  {
    "id": "real-465",
    "name": "vedraj Jagdale"
  },
  {
    "id": "real-466",
    "name": "Vaishali Kalbhor"
  },
  {
    "id": "real-467",
    "name": "iresh Jetagi"
  },
  {
    "id": "real-468",
    "name": "Suyog Patil"
  },
  {
    "id": "real-469",
    "name": "Yash Deshpande"
  },
  {
    "id": "real-470",
    "name": "Vaishnavi Shinde"
  },
  {
    "id": "real-471",
    "name": "G.C.R Gaming"
  },
  {
    "id": "real-472",
    "name": "Ganesh Jadhav"
  },
  {
    "id": "real-473",
    "name": "Sakshi Jagadale"
  },
  {
    "id": "real-474",
    "name": "Shailesh Gaikwad"
  },
  {
    "id": "real-475",
    "name": "Ankita Manwar"
  },
  {
    "id": "real-476",
    "name": "Sejal M"
  },
  {
    "id": "real-477",
    "name": "Vicky Mule"
  },
  {
    "id": "real-478",
    "name": "Silveya Masiha"
  },
  {
    "id": "real-479",
    "name": "Yash Chavan"
  },
  {
    "id": "real-480",
    "name": "Ajay Patil"
  },
  {
    "id": "real-481",
    "name": "Shital Dhage"
  },
  {
    "id": "real-482",
    "name": "Gayatri Dalimbe"
  },
  {
    "id": "real-483",
    "name": "Adi"
  },
  {
    "id": "real-484",
    "name": "Sakshi Sali"
  },
  {
    "id": "real-485",
    "name": "Ujwal Virendra Sonawane"
  },
  {
    "id": "real-486",
    "name": "Shivam Nangare"
  },
  {
    "id": "real-487",
    "name": "Vikrant Kolse (Msdian)"
  },
  {
    "id": "real-488",
    "name": "Jatin Rajesh Chavan"
  },
  {
    "id": "real-489",
    "name": "zXcodes"
  },
  {
    "id": "real-490",
    "name": "Rupesh Mahajan"
  },
  {
    "id": "real-491",
    "name": "Manish Pandit Bhalerao"
  },
  {
    "id": "real-492",
    "name": "Payal Sutar"
  },
  {
    "id": "real-493",
    "name": "Rohit Raut"
  },
  {
    "id": "real-494",
    "name": "Sam More"
  },
  {
    "id": "real-495",
    "name": "Arati sanap"
  },
  {
    "id": "real-496",
    "name": "Guruprasad Randive"
  },
  {
    "id": "real-497",
    "name": "Meynard Angelo Genove"
  },
  {
    "id": "real-498",
    "name": "Shruu Supekar"
  },
  {
    "id": "real-499",
    "name": "Rahul Lohakare"
  },
  {
    "id": "real-500",
    "name": "Jeshurun Wakdey"
  },
  {
    "id": "real-501",
    "name": "Co-5th sem-Prerana Shimbare"
  },
  {
    "id": "real-502",
    "name": "Mayuri Kashid"
  },
  {
    "id": "real-503",
    "name": "Abhay Patange"
  },
  {
    "id": "real-504",
    "name": "Swapnil Gadkar"
  },
  {
    "id": "real-505",
    "name": "Arif Shaikh"
  },
  {
    "id": "real-506",
    "name": "Big boss"
  },
  {
    "id": "real-507",
    "name": "Dnyaneshwari Ghule"
  },
  {
    "id": "real-508",
    "name": "Sanika Kharge"
  },
  {
    "id": "real-509",
    "name": "Snehal mule"
  },
  {
    "id": "real-510",
    "name": "Pranav Jawadwar"
  },
  {
    "id": "real-511",
    "name": "Sushma Rase"
  },
  {
    "id": "real-512",
    "name": "Vedant Bhele"
  },
  {
    "id": "real-513",
    "name": "Om Tijare"
  },
  {
    "id": "real-514",
    "name": "pratik patil"
  },
  {
    "id": "real-515",
    "name": "Mayur Dinesh Chaudhari"
  },
  {
    "id": "real-516",
    "name": "Kedàr Barkale"
  },
  {
    "id": "real-517",
    "name": "Kadam Sumati"
  },
  {
    "id": "real-518",
    "name": "Rohan Sherkar"
  },
  {
    "id": "real-519",
    "name": "Sanika jadhav"
  },
  {
    "id": "real-520",
    "name": "Naman Jain"
  },
  {
    "id": "real-521",
    "name": "Maithili Deshmukh"
  },
  {
    "id": "real-522",
    "name": "Saiprasad Rampure"
  },
  {
    "id": "real-523",
    "name": "Anushka"
  },
  {
    "id": "real-524",
    "name": "Gaurav Lagad"
  },
  {
    "id": "real-525",
    "name": "Radhika Sankpal"
  },
  {
    "id": "real-526",
    "name": "Yasuu07 Rizz"
  },
  {
    "id": "real-527",
    "name": "Aniket Pasalkar"
  },
  {
    "id": "real-528",
    "name": "Mrunmayee Kulkarni"
  },
  {
    "id": "real-529",
    "name": "Radhika Kulkarni"
  },
  {
    "id": "real-530",
    "name": "Suryakant Patil"
  },
  {
    "id": "real-531",
    "name": "Prime Gamer"
  },
  {
    "id": "real-532",
    "name": "Pratik Shrangare"
  },
  {
    "id": "real-533",
    "name": "Pranjal Save"
  },
  {
    "id": "real-534",
    "name": "Kalyani Avhad"
  },
  {
    "id": "real-535",
    "name": "Amruta Lokhande"
  },
  {
    "id": "real-536",
    "name": "Sakshi Pampatwar"
  },
  {
    "id": "real-537",
    "name": "*yash Ranpise"
  },
  {
    "id": "real-538",
    "name": "Omkar Patil"
  },
  {
    "id": "real-539",
    "name": "Liya"
  },
  {
    "id": "real-540",
    "name": "Chetan Ippar"
  },
  {
    "id": "real-541",
    "name": "Payal Jamdade"
  },
  {
    "id": "real-542",
    "name": "Sushma Kalkute"
  },
  {
    "id": "real-543",
    "name": "Shreyas Borade"
  },
  {
    "id": "real-544",
    "name": "Hruthika"
  },
  {
    "id": "real-545",
    "name": "33 - Kaustubh Patil"
  },
  {
    "id": "real-546",
    "name": "Samarth Gundu"
  },
  {
    "id": "real-547",
    "name": "Vedant Khade"
  },
  {
    "id": "real-548",
    "name": "Kalyani Mule"
  },
  {
    "id": "real-549",
    "name": "Siddhesh Hinge"
  },
  {
    "id": "real-550",
    "name": "Manda Kharbe"
  },
  {
    "id": "real-551",
    "name": "Abhijit Deshmukh"
  },
  {
    "id": "real-552",
    "name": "Shivani Akhare"
  },
  {
    "id": "real-553",
    "name": "Apurva Deshpande"
  },
  {
    "id": "real-554",
    "name": "Anushkaa Pawar"
  },
  {
    "id": "real-555",
    "name": "Vedant Durgam"
  },
  {
    "id": "real-556",
    "name": "RAJ JADHAV"
  },
  {
    "id": "real-557",
    "name": "Mayur Gavle"
  },
  {
    "id": "real-558",
    "name": "Amit Pundekar"
  },
  {
    "id": "real-559",
    "name": "Piush Gogi"
  },
  {
    "id": "real-560",
    "name": "Shinde Nitin"
  },
  {
    "id": "real-561",
    "name": "Munjaji Jadhav"
  },
  {
    "id": "real-562",
    "name": "Chaitanya Murumkar"
  },
  {
    "id": "real-563",
    "name": "Surekha Kalokhe"
  },
  {
    "id": "real-564",
    "name": "Sayali Asalkar"
  },
  {
    "id": "real-565",
    "name": "Let's Play With Manthan"
  },
  {
    "id": "real-566",
    "name": "IF KHAIRNAR JANHAVI NANDLAL"
  },
  {
    "id": "real-567",
    "name": "Vaibhavi Salve"
  },
  {
    "id": "real-568",
    "name": "Atharva Shinde"
  },
  {
    "id": "real-569",
    "name": "Mithun Pawar"
  },
  {
    "id": "real-570",
    "name": "Manish Bhatia"
  },
  {
    "id": "real-571",
    "name": "Pavan Jadhav"
  },
  {
    "id": "real-572",
    "name": "Smita Bhosale"
  },
  {
    "id": "real-573",
    "name": "Yashashri Andhalkar"
  },
  {
    "id": "real-574",
    "name": "Ram Adhe"
  },
  {
    "id": "real-575",
    "name": "Bhumi Swami"
  },
  {
    "id": "real-576",
    "name": "Mrunal Jagdale"
  },
  {
    "id": "real-577",
    "name": "Prajakta Sadgar"
  },
  {
    "id": "real-578",
    "name": "Omkar pawar"
  },
  {
    "id": "real-579",
    "name": "Hemaraj Atre"
  },
  {
    "id": "real-580",
    "name": "Good Girl"
  },
  {
    "id": "real-581",
    "name": "fija shaikh"
  },
  {
    "id": "real-582",
    "name": "Sanket Jagtap"
  },
  {
    "id": "real-583",
    "name": "Action Edits"
  },
  {
    "id": "real-584",
    "name": "Rau Waghmare"
  },
  {
    "id": "real-585",
    "name": "Aditya Sadanshiv 53"
  },
  {
    "id": "real-586",
    "name": "Anuradha"
  },
  {
    "id": "real-587",
    "name": "67. Hemant Maraskolhe"
  },
  {
    "id": "real-588",
    "name": "Manjunath Gavandi"
  },
  {
    "id": "real-589",
    "name": "03_Sanika Bagal"
  },
  {
    "id": "real-590",
    "name": "Krishna savant"
  },
  {
    "id": "real-591",
    "name": "Vaishnavi Baad"
  },
  {
    "id": "real-592",
    "name": "Manthan Agrawal"
  },
  {
    "id": "real-593",
    "name": "Shravani Kulkarni"
  },
  {
    "id": "real-594",
    "name": "Mrunal Chavan"
  },
  {
    "id": "real-595",
    "name": "Namrata Aher"
  },
  {
    "id": "real-596",
    "name": "Pradeep Rathod"
  },
  {
    "id": "real-597",
    "name": "Suraj Kute"
  },
  {
    "id": "real-598",
    "name": "Amruta"
  },
  {
    "id": "real-599",
    "name": "Saikiran Panchal"
  },
  {
    "id": "real-600",
    "name": "Khushi Sankhe"
  },
  {
    "id": "real-601",
    "name": "Abhishek Dhawle"
  },
  {
    "id": "real-602",
    "name": "Pushkaraj Umbare"
  },
  {
    "id": "real-603",
    "name": "Rupali Yallu Patil"
  },
  {
    "id": "real-604",
    "name": "Tanvi Kaldate"
  },
  {
    "id": "real-605",
    "name": "Ashley Sampson"
  },
  {
    "id": "real-606",
    "name": "Revati Suryawanshi"
  },
  {
    "id": "real-607",
    "name": "Rajshri Suryawanshi"
  },
  {
    "id": "real-608",
    "name": "Akash Abhare"
  },
  {
    "id": "real-609",
    "name": "Arfat Pawaskar"
  },
  {
    "id": "real-610",
    "name": "Pooja Sabasagi"
  },
  {
    "id": "real-611",
    "name": "Saviii"
  },
  {
    "id": "real-612",
    "name": "Demo"
  },
  {
    "id": "real-613",
    "name": "Pranay Balpande"
  },
  {
    "id": "real-614",
    "name": "Atharva Mandgaonkar"
  },
  {
    "id": "real-615",
    "name": "pratiksha patekar"
  },
  {
    "id": "real-616",
    "name": "Khushi Amle"
  },
  {
    "id": "real-617",
    "name": "Gaurav Patil96k"
  },
  {
    "id": "real-618",
    "name": "Namdev Shelke"
  },
  {
    "id": "real-619",
    "name": "Raj patil"
  },
  {
    "id": "real-620",
    "name": "Sakshi Sonawane"
  },
  {
    "id": "real-621",
    "name": "vaishnavi"
  },
  {
    "id": "real-622",
    "name": "Xyz"
  },
  {
    "id": "real-623",
    "name": "Kinjalgamit Gamit"
  },
  {
    "id": "real-624",
    "name": "Sainath Birajdar"
  },
  {
    "id": "real-625",
    "name": "Omkar Kalshetti"
  },
  {
    "id": "real-626",
    "name": "Jay"
  },
  {
    "id": "real-627",
    "name": "s prashant"
  },
  {
    "id": "real-628",
    "name": "Pranita F"
  },
  {
    "id": "real-629",
    "name": "Prachi Kolpe"
  },
  {
    "id": "real-630",
    "name": "Sahil Kirtane"
  },
  {
    "id": "real-631",
    "name": "Ishwari Shirsath"
  },
  {
    "id": "real-632",
    "name": "Kalpana Suryawanshi"
  },
  {
    "id": "real-633",
    "name": "Aditi Jegavkar"
  },
  {
    "id": "real-634",
    "name": "Bhushan Chaudhari"
  },
  {
    "id": "real-635",
    "name": "Vedant Jaldewar"
  },
  {
    "id": "real-636",
    "name": "52.Santosh Gade"
  },
  {
    "id": "real-637",
    "name": "sayee"
  },
  {
    "id": "real-638",
    "name": "Vishwas Barangule"
  },
  {
    "id": "real-639",
    "name": "Sanket Sanap"
  },
  {
    "id": "real-640",
    "name": "sonal kumavat"
  },
  {
    "id": "real-641",
    "name": "Dhananjay Katgaonkar"
  },
  {
    "id": "real-642",
    "name": "Shreyas Gudhe"
  },
  {
    "id": "real-643",
    "name": "Renuka Chaudhari"
  },
  {
    "id": "real-644",
    "name": "PRANJAL PATIL"
  },
  {
    "id": "real-645",
    "name": "Laxmi Patil"
  },
  {
    "id": "real-646",
    "name": "Anand Mondhe"
  },
  {
    "id": "real-647",
    "name": "Dnyaneshwar Rajput"
  },
  {
    "id": "real-648",
    "name": "Vasudha Gaikwad"
  },
  {
    "id": "real-649",
    "name": "Naushad pavale"
  },
  {
    "id": "real-650",
    "name": "Lalit Thakare CO 55"
  },
  {
    "id": "real-651",
    "name": "Athrava Birajdar"
  },
  {
    "id": "real-652",
    "name": "Mayuri Gate"
  },
  {
    "id": "real-653",
    "name": "48.Avinash Bachne"
  },
  {
    "id": "real-654",
    "name": "Anushka Kedari"
  },
  {
    "id": "real-655",
    "name": "Abhay Waje"
  },
  {
    "id": "real-656",
    "name": "Yash Shinde"
  },
  {
    "id": "real-657",
    "name": "Rushali Sarode"
  },
  {
    "id": "real-658",
    "name": "Pragati Wathore"
  },
  {
    "id": "real-659",
    "name": "Pranjal Harugade"
  },
  {
    "id": "real-660",
    "name": "adarsh chavan"
  },
  {
    "id": "real-661",
    "name": "Sidharth Patil"
  },
  {
    "id": "real-662",
    "name": "OM Jawanekar"
  },
  {
    "id": "real-663",
    "name": "Nandini Panchal"
  },
  {
    "id": "real-664",
    "name": "Shreedhar Hodage"
  },
  {
    "id": "real-665",
    "name": "Patil Sharad"
  },
  {
    "id": "real-666",
    "name": "Saksham Bari"
  },
  {
    "id": "real-667",
    "name": "Vaishali Shelke"
  },
  {
    "id": "real-668",
    "name": "Ankush Akhade"
  },
  {
    "id": "real-669",
    "name": "Jay Mahajan"
  },
  {
    "id": "real-670",
    "name": "Pallavi Holkar"
  },
  {
    "id": "real-671",
    "name": "Niteen Patil"
  },
  {
    "id": "real-672",
    "name": "Prarthana Kumbhar"
  },
  {
    "id": "real-673",
    "name": "Om Dambale"
  },
  {
    "id": "real-674",
    "name": "Dhanashri Ghavate"
  },
  {
    "id": "real-675",
    "name": "Sanskar Dumbre"
  },
  {
    "id": "real-676",
    "name": "Ganesh Patil"
  },
  {
    "id": "real-677",
    "name": "Swati Khade"
  },
  {
    "id": "real-678",
    "name": "Aditi Khot"
  },
  {
    "id": "real-679",
    "name": "Ankita more"
  },
  {
    "id": "real-680",
    "name": "Shreya"
  },
  {
    "id": "real-681",
    "name": "Prem Gaikwad"
  },
  {
    "id": "real-682",
    "name": "Ish Chaniyara"
  },
  {
    "id": "real-683",
    "name": "Dnyaneshwari Khule"
  },
  {
    "id": "real-684",
    "name": "Vedant Shimpi"
  },
  {
    "id": "real-685",
    "name": "Rushi Jadhav"
  },
  {
    "id": "real-686",
    "name": "Samruddhi Hatolkar"
  },
  {
    "id": "real-687",
    "name": "Payal Shelke"
  },
  {
    "id": "real-688",
    "name": "Samir More"
  },
  {
    "id": "real-689",
    "name": "Bhagawat Jadhav"
  },
  {
    "id": "real-690",
    "name": "Chaitanya"
  },
  {
    "id": "real-691",
    "name": "GVK"
  },
  {
    "id": "real-692",
    "name": "Prasad Kotkar"
  },
  {
    "id": "real-693",
    "name": "15 Om Sapdhare"
  },
  {
    "id": "real-694",
    "name": "Shradha Patil"
  },
  {
    "id": "real-695",
    "name": "Shreya Raut"
  },
  {
    "id": "real-696",
    "name": "Bhumika swami"
  },
  {
    "id": "real-697",
    "name": "Kedar Ganpurkar"
  },
  {
    "id": "real-698",
    "name": "Ro S"
  },
  {
    "id": "real-699",
    "name": "Khushi Doshi"
  },
  {
    "id": "real-700",
    "name": "Yash Shewale"
  },
  {
    "id": "real-701",
    "name": "Samiksha Raut"
  },
  {
    "id": "real-702",
    "name": "Komal sonawane"
  },
  {
    "id": "real-703",
    "name": "Vanita Sarate"
  },
  {
    "id": "real-704",
    "name": "Vaidehi Gadhari"
  },
  {
    "id": "real-705",
    "name": "aditi"
  },
  {
    "id": "real-706",
    "name": "Sojwal Kene"
  },
  {
    "id": "real-707",
    "name": "Sanskar"
  },
  {
    "id": "real-708",
    "name": "Rajaram Nhavkar"
  },
  {
    "id": "real-709",
    "name": "sesp memes"
  },
  {
    "id": "real-710",
    "name": "Mr. RK"
  },
  {
    "id": "real-711",
    "name": "Rahul Patil"
  },
  {
    "id": "real-712",
    "name": "Kartik Ch"
  },
  {
    "id": "real-713",
    "name": "Bahubali Nalte"
  },
  {
    "id": "real-714",
    "name": "sanjivani patil"
  },
  {
    "id": "real-715",
    "name": "CHAITANYA LOMATE"
  },
  {
    "id": "real-716",
    "name": "Ramesh Kamble"
  },
  {
    "id": "real-717",
    "name": "Shruti Wagh"
  },
  {
    "id": "real-718",
    "name": "Bhushan Sawant"
  },
  {
    "id": "real-719",
    "name": "Hello World"
  },
  {
    "id": "real-720",
    "name": "Kamble Pranjali"
  },
  {
    "id": "real-721",
    "name": "Shivam Lagdive"
  },
  {
    "id": "real-722",
    "name": "Tushar Deshpande"
  },
  {
    "id": "real-723",
    "name": "Aishwarya Shinde"
  },
  {
    "id": "real-724",
    "name": "Maithili Kote"
  },
  {
    "id": "real-725",
    "name": "purva zope"
  },
  {
    "id": "real-726",
    "name": "Dnyaneshwar ghodke"
  },
  {
    "id": "real-727",
    "name": "Sayali Shinde"
  },
  {
    "id": "real-728",
    "name": "Lagdive Shivam Nitin"
  },
  {
    "id": "real-729",
    "name": "Prem Khaire"
  },
  {
    "id": "real-730",
    "name": "Amit Lagdive"
  },
  {
    "id": "real-731",
    "name": "Jay Wagh"
  },
  {
    "id": "real-732",
    "name": "Arpita Dudhanikar"
  },
  {
    "id": "real-733",
    "name": "CO-5th sem-Vinay Raut"
  },
  {
    "id": "real-734",
    "name": "Pranav korade"
  },
  {
    "id": "real-735",
    "name": "Vighnesh Khirid"
  },
  {
    "id": "real-736",
    "name": "Sakshi Mane"
  },
  {
    "id": "real-737",
    "name": "Gayatri Sable"
  },
  {
    "id": "real-738",
    "name": "Milind Nagare"
  },
  {
    "id": "real-739",
    "name": "Nishant Pimple"
  },
  {
    "id": "real-740",
    "name": "Yash Birari"
  },
  {
    "id": "real-741",
    "name": "Samrudhi deshmukh"
  },
  {
    "id": "real-742",
    "name": "Sneha Barangule"
  },
  {
    "id": "real-743",
    "name": "Sumit Patil"
  },
  {
    "id": "real-744",
    "name": "Atharv More"
  },
  {
    "id": "real-745",
    "name": "Manas Patil"
  },
  {
    "id": "real-746",
    "name": "anushka tamboli"
  },
  {
    "id": "real-747",
    "name": "Zishan Shaikh"
  },
  {
    "id": "real-748",
    "name": "Shree"
  },
  {
    "id": "real-749",
    "name": "pranav vetal"
  },
  {
    "id": "real-750",
    "name": "Take It"
  },
  {
    "id": "real-751",
    "name": "Aarya Patil - Kurle"
  },
  {
    "id": "real-752",
    "name": "Varsha Landge"
  },
  {
    "id": "real-753",
    "name": "Onkar Kharat"
  },
  {
    "id": "real-754",
    "name": "Moreshwar Sargar"
  },
  {
    "id": "real-755",
    "name": "Shantanu Holey"
  },
  {
    "id": "real-756",
    "name": "Deep gaichor"
  },
  {
    "id": "real-757",
    "name": "Shraddha Bavge"
  },
  {
    "id": "real-758",
    "name": "Kadambari Ganore"
  },
  {
    "id": "real-759",
    "name": "Yagnesh Kotwal"
  },
  {
    "id": "real-760",
    "name": "Yash Bhakare"
  },
  {
    "id": "real-761",
    "name": "Neha bhayegave"
  },
  {
    "id": "real-762",
    "name": "Deep Deshmukh"
  },
  {
    "id": "real-763",
    "name": "Shivam Shetkar"
  },
  {
    "id": "real-764",
    "name": "sakshi patil"
  },
  {
    "id": "real-765",
    "name": "Janhavi"
  },
  {
    "id": "real-766",
    "name": "Gaurav Dilip Chavan"
  },
  {
    "id": "real-767",
    "name": "Sanika Jagdale"
  },
  {
    "id": "real-768",
    "name": "Shivam Raut"
  },
  {
    "id": "real-769",
    "name": "Omkar Waghmare"
  },
  {
    "id": "real-770",
    "name": "Vaishnavi Bhosale"
  },
  {
    "id": "real-771",
    "name": "nikhil indalkar"
  },
  {
    "id": "real-772",
    "name": "Bhushan Naresh Zunjarrao"
  },
  {
    "id": "real-773",
    "name": "Chaitanya Varpe"
  },
  {
    "id": "real-774",
    "name": "Vaishnavi Keshavshetty"
  },
  {
    "id": "real-775",
    "name": "Kanchan Bardapure"
  },
  {
    "id": "real-776",
    "name": "Sarthak Shekade"
  },
  {
    "id": "real-777",
    "name": "Shravani Sonavane"
  },
  {
    "id": "real-778",
    "name": "Samarth Alandkar"
  },
  {
    "id": "real-779",
    "name": "Shrikant Dongare"
  },
  {
    "id": "real-780",
    "name": "Janvi Warhade"
  },
  {
    "id": "real-781",
    "name": "akshay gamer"
  },
  {
    "id": "real-782",
    "name": "Pratiksha Rahinj"
  },
  {
    "id": "real-783",
    "name": "Sujata Jawale"
  },
  {
    "id": "real-784",
    "name": "Sanika Chandewar"
  },
  {
    "id": "real-785",
    "name": "Samiksha Toraskar"
  },
  {
    "id": "real-786",
    "name": "Jay Shewale"
  },
  {
    "id": "real-787",
    "name": "Shivani Gujar"
  },
  {
    "id": "real-788",
    "name": "Samarth Swami"
  },
  {
    "id": "real-789",
    "name": "Atharva Vadam"
  },
  {
    "id": "real-790",
    "name": "shreya nalawade"
  },
  {
    "id": "real-791",
    "name": "Junaid Nandrekar"
  },
  {
    "id": "real-792",
    "name": "Jay Parab"
  },
  {
    "id": "real-793",
    "name": "Arnav Karangutkar"
  },
  {
    "id": "real-794",
    "name": "Rashmi Badgujar"
  },
  {
    "id": "real-795",
    "name": "Shruti Gurav"
  },
  {
    "id": "real-796",
    "name": "Rajat Surana"
  },
  {
    "id": "real-797",
    "name": "Unnati Kale"
  },
  {
    "id": "real-798",
    "name": "04:Bache Snehal"
  },
  {
    "id": "real-799",
    "name": "AARYA KABRA"
  },
  {
    "id": "real-800",
    "name": "प्रकाश कुरुंद"
  },
  {
    "id": "real-801",
    "name": "Soham Gharge"
  },
  {
    "id": "real-802",
    "name": "Dhanashri Nanekar"
  },
  {
    "id": "real-803",
    "name": "Krushna"
  },
  {
    "id": "real-804",
    "name": "ANUJ CHHAJED"
  },
  {
    "id": "real-805",
    "name": "Viraj Dinde"
  },
  {
    "id": "real-806",
    "name": "Savni Jadhav"
  },
  {
    "id": "real-807",
    "name": "Samruddhi Hawaladr"
  },
  {
    "id": "real-808",
    "name": "Vaishnavi Deore"
  },
  {
    "id": "real-809",
    "name": "Ganesh Kumbhar"
  },
  {
    "id": "real-810",
    "name": "Radhika Jangam"
  },
  {
    "id": "real-811",
    "name": "Moraya Sargar"
  },
  {
    "id": "real-812",
    "name": "Cristiano"
  },
  {
    "id": "real-813",
    "name": "Suyash Mane"
  },
  {
    "id": "real-814",
    "name": "Sachin Rathod"
  },
  {
    "id": "real-815",
    "name": "Sejas Attarde80"
  },
  {
    "id": "real-816",
    "name": "Private"
  },
  {
    "id": "real-817",
    "name": "Shlok Chaudhari"
  },
  {
    "id": "real-818",
    "name": "Prachi Tanaji Dhere"
  },
  {
    "id": "real-819",
    "name": "Harsh Gaikwad"
  },
  {
    "id": "real-820",
    "name": "Harsh Pawar"
  },
  {
    "id": "real-821",
    "name": "Shreya Kolhapure"
  },
  {
    "id": "real-822",
    "name": "Sanskar Jagtap"
  }
];

const FAKE_TIMES = [
  "2 minutes ago",
  "5 minutes ago",
  "8 minutes ago",
  "12 minutes ago",
  "18 minutes ago",
  "23 minutes ago",
  "30 minutes ago",
  "35 minutes ago",
  "42 minutes ago",
  "45 minutes ago",
  "55 minutes ago",
  "1 hour ago",
  "2 hours ago",
];

const AVATAR_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];

export default function PremiumUserNotifications() {
  const [users, setUsers] = useState<User[]>(FALLBACK_USERS);
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fakeTime, setFakeTime] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [dismissed, setDismissed] = useState(false);

  // Fetch users from Firebase
  useEffect(() => {
    let unsubscribe = () => { };
    try {
      const usersRef = ref(database, "Users");

      unsubscribe = onValue(
        usersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const usersList: User[] = [];

            Object.entries(data).forEach(([id, userData]: [string, any]) => {
              if (userData.name) {
                usersList.push({
                  id,
                  name: userData.name,
                });
              }
            });

            if (usersList.length > 0) {
              setUsers(usersList);
            }
          }
        },
        (error) => {
          // Gracefully fail silently to avoid logging console.error
          // which can trigger Next.js error overlays in development mode.
          // Fallback users list remains active.
        }
      );
    } catch (err) {
      // Gracefully handle any startup/permission errors silently
    }
    return () => {
      try {
        unsubscribe();
      } catch (e) { }
    };
  }, []);

  const showNotification = useCallback(() => {
    if (users.length === 0) return;

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomTime = FAKE_TIMES[Math.floor(Math.random() * FAKE_TIMES.length)];
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    setCurrentUser(randomUser);
    setFakeTime(randomTime);
    setAvatarColor(randomColor);
    setDismissed(false);
    setVisible(true);

    // Auto-hide after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [users]);

  // Show notifications every 45 seconds
  useEffect(() => {
    if (users.length === 0) return;

    // Show first notification after a short delay
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 3000);

    // Repeat every 45 seconds
    const interval = setInterval(() => {
      showNotification();
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [users, showNotification]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <>
      {/* Notification Styles */}
      <style jsx global>{`
        @keyframes notif-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .premium-notif-card {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          pointer-events: auto;
          width: 340px;
          max-width: calc(100vw - 32px);
        }
        .premium-notif-inner {
          background: #ffffff;
          border-radius: 14px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.04);
          padding: 16px;
          position: relative;
          overflow: hidden;
        }
        .premium-notif-inner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b, #ef4444, #ec4899);
        }
        .premium-notif-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 0 0 14px 14px;
          animation: notif-progress 6s linear forwards;
        }
        .premium-notif-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .premium-notif-avatar {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .premium-notif-text {
          flex: 1;
          min-width: 0;
        }
        .premium-notif-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
        }
        .premium-notif-msg {
          font-size: 13px;
          color: #475569;
          margin: 2px 0 0 0;
          line-height: 1.4;
        }
        .premium-notif-msg strong {
          color: #dc2626;
          font-weight: 600;
        }
        .premium-notif-time {
          font-size: 11px;
          color: #94a3b8;
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .premium-notif-time::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }
        .premium-notif-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 22px;
          height: 22px;
          border: none;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          transition: all 0.15s ease;
        }
        .premium-notif-close:hover {
          background: #e2e8f0;
          color: #334155;
        }
        @media (max-width: 480px) {
          .premium-notif-card {
            bottom: 16px;
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
      `}</style>

      <AnimatePresence>
        {visible && !dismissed && currentUser && (
          <motion.div
            key={currentUser.id + fakeTime}
            className="premium-notif-card"
            initial={{ opacity: 0, y: 60, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 40, x: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="premium-notif-inner">
              {/* Top gradient bar is via ::before */}
              <div className="premium-notif-content">
                {/* Avatar */}
                <div
                  className="premium-notif-avatar"
                  style={{ background: avatarColor }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>

                {/* Text */}
                <div className="premium-notif-text">
                  <p className="premium-notif-name">{currentUser.name}</p>
                  <p className="premium-notif-msg">
                    joined <strong>Premium Counselling</strong>
                  </p>
                  <p className="premium-notif-time">{fakeTime}</p>
                </div>
              </div>

              {/* Close button */}
              <button
                className="premium-notif-close"
                onClick={handleDismiss}
                aria-label="Dismiss notification"
              >
                ✕
              </button>

              {/* Bottom progress bar */}
              <div className="premium-notif-progress" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

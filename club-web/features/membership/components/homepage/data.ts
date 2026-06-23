import { Club } from "./ClubCard";

export const clubs: Club[] = [
  {
    id: 1,
    title: "NEW OXFORD & MANCHESTER POLO CLUB",
    image: "/images/newoxford.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 2,
    title: "RICHMOND HIGH POLO PARK",
    image: "/images/richmondhigh.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 3,
    title: "KiraCraft Art Club",
    image: "/images/kiracraft.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 4,
    title: "NEW OXFORD & MANCHESTER POLO CLUB",
    image: "/images/newoxford.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 5,
    title: "RICHMOND HIGH POLO PARK",
    image: "/images/richmondhigh.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 6,
    title: "KiraCraft Art Club",
    image: "/images/kiracraft.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
  {
    id: 7,
    title: "KiraCraft Art Club",
    image: "/images/kiracraft.png",
    description: "We paint every Saturday morning.",
    tags: ["Art", "Bangkok", "Weekly"],
    members: 142,
    type: "private",
  },
] as const;

export interface Topic {
  id: number;
  topic: string;
}

export const topics: Topic[] = [
  { id: 1, topic: "Polo" },
  { id: 2, topic: "Tennis" },
  { id: 3, topic: "Basketball" },
  { id: 4, topic: "Skiing" },
  { id: 5, topic: "Ping Pong" },
  { id: 6, topic: "Swimming" },
  { id: 7, topic: "Painting" },
  { id: 8, topic: "Illustration" },
  { id: 9, topic: "Cooking" },
  { id: 10, topic: "Japanese Cuisine" },
  { id: 11, topic: "Movies" },
  { id: 12, topic: "Music" },
  { id: 13, topic: "Mathematics" },
  { id: 14, topic: "Chemistry" },
  { id: 15, topic: "Environment" },
  { id: 16, topic: "Cleaning" },
  { id: 17, topic: "e-Sports" },
  { id: 18, topic: "Language" },
  { id: 19, topic: "Spa" },
  { id: 20, topic: "Hotels" },
  { id: 21, topic: "Comics" },
  { id: 22, topic: "Library" },
  { id: 23, topic: "Travel" },
] as const;

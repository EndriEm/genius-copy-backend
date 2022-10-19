import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 2222;

const SECRET = process.env.SECRET!;

function getToken(id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: "1 day",
  });
}

async function getCurrentUser(token: string) {
  const decryptedInfo = jwt.verify(token, SECRET);
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decryptedInfo.id },
  });
  return user;
}

app.get("/genres", async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      include: { songs: true },
    });
    res.send(genres);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/genres/:id", async (req, res) => {
  try {
    const genre = await prisma.genre.findUnique({
      where: { id: Number(req.params.id) },
      include: { songs: true },
    });

    if (genre) {
      res.send(genre);
    } else {
      res.status(404).send({ error: "Genre not found." });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/songs", async (req, res) => {
  try {
    const songs = await prisma.song.findMany({});
    res.send(songs);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});



app.get("/songs/:id", async (req, res) => {
    try {
      const song = await prisma.song.findUnique({
        where: { id: Number(req.params.id) },
        
      });
  
      if (song) {
        res.send(song);
      } else {
        res.status(404).send({ error: "Song not found." });
      }
    } catch (error) {
      //@ts-ignore
      res.status(400).send({ error: error.message });
    }
  });


  app.post("/sign-up", async (req, res) => {
    try {
      const match = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
  
      if (match) {
        res.status(400).send({ error: "This account already exists." });
      } else {
        const user = await prisma.user.create({
          data: {
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
            name: req.body.name
          },
        });
  
        res.send({ user: user, token: getToken(user.id) });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });
  
  app.post("/sign-in", async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.send({ user: user, token: getToken(user.id) });
    } else {
      res.status(400).send({ error: "Invalid email/password combination." });
    }
  });
  
  app.get("/validate", async (req, res) => {
    try {
      if (req.headers.authorization) {
        const user = await getCurrentUser(req.headers.authorization);
        // @ts-ignore
        res.send({ user, token: getToken(user.id) });
      }
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  });
  
  app.listen(port);
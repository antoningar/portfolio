export const ROBOTS: any = [
    {
        filename: "/rapjeurobot.glb",
        basePosition: {
            x: 0, y: 0, z: 0
        },
        plan: [
            ["z", 10, 90],
            ["x", 10, 90],
            ["z", 10, 90],
            ["x", 10, 90],
        ],
        title: "discord bot rap jeu",
        text: "Discord bot inspired by the Youtube show Rap Jeu\nAllowing users to play roland gamos and mystery cards\nBot in python, using discord.py, sqlite (leaderboard) and spotify API\nWas deployed on OVH vps for a 400+ users discord server",
        repository: "https://github.com/antoningar/BotRapJeu"
    },
    {
        filename: "/gptrobot.glb",
        basePosition: {
            x: 10, y: 0, z: 10
        },
        plan: [
            ["z", 10, -90],
            ["x", 10, -90],
            ["z", 10, -90],
            ["x", 10, -90],
        ],
        title: "discord chatgpt bot",
        text: "Discord bot allowing users to trigger ChatGPT in a private conversation\nBot in C#, using discord .net, openAI API and cosmos DB (conversation historic)\nCI/CD on azure devops, deploy on an azure web app as a webjob",
        repository: "https://github.com/antoningar/GptBot"
    },
    {
        filename: "/geoguessrrobot.glb",
        basePosition: {
            x: -10, y: 0, z: -10
        },
        plan: [
            ["z", 10, -90],
            ["x", 10, -90],
            ["z", 10, -90],
            ["x", 10, -90],
        ],
        title: "discord geoguessr bot",
        text: "Discord bot allowing users to play multiplayer geoguessr games without premium account\nBot in C#, using discord .net and a personnal selenium remotedriver (on OVH vps)\nCI/CD on azure devops, deploy on an azure web app as a webjob",
        repository: "https://github.com/antoningar/BotGeoguessr"
    },
    {
        filename: "/sneprobot.glb",
        basePosition: {
            x: 10, y: 0, z: -10
        },
        plan: [
            ["z", 10, -90],
            ["x", 10, -90],
            ["z", 10, -90],
            ["x", 10, -90],
        ],
        title: "REST snepapi",
        text: "Rest unofficial SNEP API to see all french music certifications\nAPI in python, using django, drf, beautifull soup and sqlite\nCI on gitlab, deployed on OVH vps",
        repository: "https://github.com/antoningar/snepapi"
    }
]
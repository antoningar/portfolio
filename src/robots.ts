export const ROBOTS: any = [
    {
        filename: "/discordrobot.glb",
        basePosition: {
            x: 0, y: 0, z: 0
        },
        plan: [
            ["z", 10, 90],
            ["x", 10, 90],
            ["z", 10, 90],
            ["x", 10, 90],
            ],
        text: "Hello!\nMy name is Antonin, I'm into computing since 2016.\nI did a lot of different things so click on any other robots to learn more about me !"
    },
    {
        filename: "/studentrobot.glb",
        basePosition: {
            x: 10, y: 0, z: 10
        },
        plan: [
            ["z", 10, -90],
            ["x", 10, -90],
            ["z", 10, -90],
            ["x", 10, -90],
            ],
        text: "I have two degree in computing :\nDUT in computing science in Bayonne, 2018\nSoftware engineer from ENSICAEN in Caen, 2021."
    }
]
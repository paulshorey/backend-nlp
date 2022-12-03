export default [
  {
    method: "get",
    path: "/",
    response: () => {
      return {
        v: "3",
        time: Date.now(),
        greetings: [
          "hi",
          "howdy",
          "hey",
          "shalom",
          "salam",
          "aloha",
          "hola",
          "goodbye",
          "bonjour",
          "ciao",
          "wassup",
          "hello",
          "salutation",
          "welcome",
          "hullo",
          "hallo",
          "hiya",
          "hug",
          "kiss",
          "welcome",
          "hello there"
        ]
      }
    }
  }
]

const dialog = [
  {
    language : "English",
    trigger : "NEED",
    yes: "YES",
    messages : {
      step1: "Thank you for contacting Harvey Needs Matching. We are very sorry for the loss you have experienced. What are your immediate needs? Please be specific.",
      step2: handlebars.compile('Can we contact you at {{ phone }}? ' +
        'Reply "{{ yes }}" or provide alternate contact info.'),
      step3: "What is your current zip code?",
      stepDone: "Thank you! Someone will soon be in contact with you to help."
    }
  },{
    language : "Spanish",
    trigger : "NECESIDAD",
    //triggers : ["NECESITAR", "NECESITO"],
    yes: ["SÍ", "SI"],
    messages : {
      step1: "Gracias por contactar Harvey Necesidades. Lamentamos mucho la pérdida que ha experimentado. ¿Cuáles son sus necesidades inmediatas? Por favor sea especifico.",
      step2: handlebars.compile('¿Podemos ponernos en contacto con usted en ' +
        '{{ phone }}? Responda "{{ yes }}" o proporcione un número alternativo.'),
      step3: "¿Cuál es su código postal actual?",
      stepDone: "¡Gracias! Alguien estará en contacto con ti pronto para ayudar."
    }
  }
]

module.exports = dialog;

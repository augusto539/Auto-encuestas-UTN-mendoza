// REQUIRES
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');




const router = express.Router();

// function to replace characters
String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
 

// gets
router.get('/', (req, res) => {
  res.render('index.html', {title: ''});
});

// posts
// get information about the surveys to complete
router.post('/get_info', (req, res) => {
  const url = 'http://encuesta.frm.utn.edu.ar/encuesta_materia/encuestamat.php?legajo=' + req.body.legajo //url of the survey selector
  
  get_info(url).then((data) => {
    res.cookie('data',data.info)  // safe the data in a cookie

    res.render('auto_form.html', {title: ' - Autocompletar', legajo:req.body.legajo, info:data.materias, h2:'', button_state:''});  // show the config page
  });
});

// serch the rest of info and send the post with the data
router.post('/res/:legajo', (req,res) => {

  let data = req.cookies.data;  //load the data in the cookie
  let url = 'http://encuesta.frm.utn.edu.ar/encuesta_materia/encuestamat.php' //url of the survey
  
  
  encuesta(url,data,req).then(() => {
    res.render('responce.html', {title: '', legajo:req.params.legajo}); // show the finish page
  })

})


module.exports = router;



async function encuesta(url,data,req){
  for (let i = 0; i < (Object.keys(req.body).length - 1); i++) {

    let params = `legajo=${req.params.legajo}&ano=${data.ano}&especialidad=${data.especialidad}&materia=${req.body[i]}&plan=${data.plan}` //params of the first post

    let calification = '-1'

    if (req.body['option'] == 'ns') {
      calification = '-1';
    };
    if ((req.body['option']) == 'siempre'){
      calification = '4';
    };
    if ((req.body['option']) == 'insuficiente'){
      calification = '0';
    };

    const response_encoded = await axios({  //send the first post to get the survey html
      url: url,
      method: 'POST',
      data: params,
      responseType: 'arraybuffer',
      responseEncoding: 'binary'
    });

    let response_decoded = response_encoded.data.toString('binary');  // decode the 

    const $ = cheerio.load(response_decoded); // load the response in cherio

    let siglas = [];

    $('table').find("span[class='Estilo20']").each((parentIdx,parentElm) =>{  // serch for the span with class 'Estilo 20' in the table tags
      let span = $(parentElm).html()  // get the text of the span

      // serch for a '(' in the span and take the value between them
      if (span.includes('(')) {
        let posision_1 = span.indexOf("(");  // take the index of the first '('
        let posision_2 = span.indexOf(")"); 

        let initials = span.slice((posision_1 + 1), posision_2); // take the value between the braquets
        initials = initials.toLocaleLowerCase()   // pasrses the value to lowercase

        siglas.push(initials) // saves in the siglas array
      };
    });

    let radio = new Object()

    for (let i = 1; i < 8; i++) {
      radio['p'+i] = calification 
    };
    

    let prof_res = new Object()

    siglas.forEach(element => {
      for (let i = 1; i < 20; i++) {
        if (element.charAt(0) == 'j') {
          if (i == 5 || i == 9 || i == 10 || i == 19){
            continue
          }
          prof_res[element+i] = calification
        } else if (element.charAt(0) == 'a') {
          if (i == 5 || i == 9 || i == 10 || i == 16 || i == 19){
            continue
          }
          prof_res[element+i] = calification
        } else {
          prof_res[element+i] = calification
        }
      }
    });

    let prof_res_text = new Object()

    siglas.forEach(element => {
      for (let i = 8; i < 11; i++) {
        prof_res_text[element+'_'+i] = '★'
      }
    });


    let info = {
      legajo: $("input[name='legajo']").attr('value'),
      ano: $("input[name='ano']").attr('value'),
      especialidad: $("input[name='especialidad']").attr('value'),
      materia: $("input[name='materia']").attr('value'),
      plan: $("input[name='plan']").attr('value'),
      comisionalumno: $("input[name='comisionalumno']").attr('value'),
      prof1: $("input[name='prof1']").attr('value'),
      prof3: $("input[name='prof3']").attr('value'),
      prof4: $("input[name='prof4']").attr('value'),
      prof5: $("input[name='prof5']").attr('value'),
      prof6: $("input[name='prof6']").attr('value'),
      check: $("input[name='check']").attr('value'),
      grabadatos: $("input[name='grabadatos']").attr('value'),
      button2: $("input[name='button2']").attr('value')
    }


    const post = {...radio, ...prof_res, ...prof_res_text, ...info }

    let post_2 = ''

    for (const key of Object.keys(post)) {
      post_2 = post_2 + key + "=" + post[key] + '&'
    }

    post_2 = post_2.replaceAt((post_2.length - 1), " ")
           
    // send the second post (the one with the info)
    /*
    axios({
      url: url,
      method: 'POST',
      data: post_2,
    })//.then(res => console.log(res))
    */
  }
};


async function get_info(url){
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer',
    responseEncoding: 'binary'
  });

  let data = response.data.toString('binary');

  //console.log(data.data)

  let materias =[]

  const $ = cheerio.load(data);
  $('a').each((parentIdx,parentElm) =>{ 
    let class_code = $(parentElm).attr('onclick');
    class_code = class_code.slice(17, 20);

    let materia = $(parentElm).text();
    materias.push({code:class_code, text:materia})

  });

  const info =
    {
      ano: $("input[name='ano']").attr('value'),
      especialidad: $("input[name='especialidad']").attr('value'),
      plan: $("input[name='plan']").attr('value'),
    }
  
  return {materias:materias, info:info}
}


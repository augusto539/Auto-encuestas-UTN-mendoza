// REQUIRES
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
// VARIABLES
const router = express.Router();
// /get_info
var url = '';
let class_code = '';
let materia = '';
let info_alumno = {ano: '', especialidad: '', plan:''};
// /res/:legajo
let url_survey = 'http://encuesta.frm.utn.edu.ar/encuesta_materia/encuestamat.php'; //url of the survey
// encuesta
let calification = '-1';
let span = '';
let posision_1 = '';
let posision_2 = '';
let initials = '';
let radio = new Object();
let prof_res = new Object();
let prof_res_text = new Object();
let prof_text = '★'
let info_encuesta = {
  legajo: '',
  ano: '',
  especialidad: '',
  materia: '',
  plan: '',
  comisionalumno: '',
  prof1: '',
  prof3: '',
  prof4: '',
  prof5: '',
  prof6: '',
  check: '',
  grabadatos: '',
  button2: ''
};
let dic_post = {};
let string_post = '';

// function to replace characters
String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
 
// gets
// index
router.get('/', (req, res) => {
  res.render('index.html', {title: '', alert:'none', error:''});
});
// index-error
router.get('/error/:error', (req, res) => {
  res.render('index.html', {title: '', alert:'', error:req.params.error});
});
// finish page
router.get('/completadas/:legajo', (req, res) => {
  res.render('responce.html', {title: '', legajo:req.params.legajo}); // show the finish page
});

// posts
// get information about the surveys to complete
router.post('/get_info', (req, res) => {
  url = 'http://encuesta.frm.utn.edu.ar/encuesta_materia/encuestamat.php?legajo=' + req.body.legajo; //url of the survey selector 
  get_info(url).then((data) => {
    if (Object.keys(data).includes("error")) {
      res.redirect('/error/' + data.error);
    } else {
      res.cookie('data',data.info);  // safe the data in a cookie
      res.render('auto_form.html', {title: ' - Autocompletar', alert:'none', error:'', legajo:req.body.legajo, info:data.materias});  // show the config page
    };
  });
});
// serch the rest of info and send the post with the data
router.post('/res/:legajo', (req,res) => {
  let data = req.cookies.data;  //load the data in the cookie  
  encuesta(url_survey,data,req).then(() => {
    res.redirect('/completadas/' + req.params.legajo);
  });
});

module.exports = router;

async function encuesta(url,data,req){
  let siglas = [];
  for (let i = 0; i < (Object.keys(req.body).length - 1); i++) {
    let params = `legajo=${req.params.legajo}&ano=${data.ano}&especialidad=${data.especialidad}&materia=${req.body[i]}&plan=${data.plan}`; //params of the first post

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

    $('table').find("span[class='Estilo20']").each((parentIdx,parentElm) =>{  // serch for the span with class 'Estilo 20' in the table tags
      span = $(parentElm).html();  // get the text of the span

      // serch for a '(' in the span and take the value between them
      if (span.includes('(')) {
        posision_1 = span.indexOf("(");  // take the index of the first '('
        posision_2 = span.indexOf(")"); 
        initials = span.slice((posision_1 + 1), posision_2); // take the value between the braquets
        initials = initials.toLocaleLowerCase();   // pasrses the value to lowercase
        siglas.push(initials); // saves in the siglas array
      };
    });

    for (let i = 1; i < 8; i++) {
      radio['p'+i] = calification;
    };

    siglas.forEach(element => {
      for (let i = 1; i < 20; i++) {
        if (element.charAt(0) == 'j') {
          if (i == 5 || i == 9 || i == 10 || i == 19){
            continue
          }
          prof_res[element+i] = calification;
        } else if (element.charAt(0) == 'a') {
          if (i == 5 || i == 9 || i == 10 || i == 16 || i == 19){
            continue
          }
          prof_res[element+i] = calification;
        } else {
          prof_res[element+i] = calification;
        }
      }
    });

    siglas.forEach(element => {
      for (let i = 8; i < 11; i++) {
        prof_res_text[element+'_'+i] = prof_text;
      }
    });

    info_encuesta = {
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
    };
    dic_post = {...radio, ...prof_res, ...prof_res_text, ...info_encuesta };

    for (const key of Object.keys(dic_post)) {
      string_post = string_post + key + "=" + dic_post[key] + '&';
    }
    string_post = string_post.replaceAt((string_post.length - 1), " ");
           
    // send the second post (the one with the info)
    axios({
      url: url,
      method: 'POST',
      data: string_post,
    });//.then(res => console.log(res))
  }
};


async function get_info(url){
  let materias = [];
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer',
    responseEncoding: 'binary'
  });
  let data = response.data.toString('binary');
  const $ = cheerio.load(data);
  if ($("span[class='title']").text() != 'Por favor Conteste las Siguientes Encuestas Docentes') {
    return {error: `Numero de legajo invalido`};
  } else {
    if ($('a').length < 1) {
      return {error: `No quedan encuestas por responder`};
    } else {
      $('a').each((parentIdx,parentElm) =>{       
        class_code = $(parentElm).attr('onclick');
        class_code = class_code.slice(17, 20);
  
        materia = $(parentElm).text();
        materias.push({code:class_code, text:materia});
      });
  
      info_alumno = {
        ano: $("input[name='ano']").attr('value'),
        especialidad: $("input[name='especialidad']").attr('value'),
        plan: $("input[name='plan']").attr('value'),
      };  
      return {materias:materias, info:info_alumno};
    }; 
  };
};


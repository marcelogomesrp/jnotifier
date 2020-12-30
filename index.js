#!/usr/bin/env node


const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const conf = require('./conf.json');

function main() {
    //console.log(JSON.stringify(conf));
    console.log("***********************************");
    console.log(`I have ${conf.sources.length} sources dir`);
    console.log("***********************************");
    conf.sources.forEach(source => {
        //console.log(`Job: ${JSON.stringify(job)}`);
        console.log(`JobName: ${source.sourcename} with ${source.rules.length} rules`);
        const runs = getAllRuns(source.src);
        console.log(`Runs ret:::: ${runs}`);
        source.rules.forEach(rule => {
            runs.forEach(run => {
                if (isRunCandidate(rule, source.src, run)) {
                    console.log(`\truninng rule: ${rule.name} is ok to ${run}`);
                    rule.files.forEach(file => {
                        console.log(`\t\tIn RUN ${run} to check: ${file.filename}`);
                        console.log(`\t\tIn RUN ${run} file content: ${file.fileContent}`);
                        console.log(" ");
                    });
                }
            });
            //console.log(`\tFile skip: ${rule.fileSkip}`);
        })

    })
    if (fs.existsSync("./teste")) {
        console.log("Sim teste");
    }

}

function getAllRuns(src) {
    let runs = [];
    console.log(`********* ${src}`);
    try {
        fs.readdirSync(src).forEach(file => {
            if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
                console.log(`file.... ${file}`);
                runs.push(file);
            }
        });
    } catch (ex) {
        const err = `Error to open dir ${src}`;
        throw err;
    }
    return runs;
}

function getAllValidRuns(src) {
    let runs = [];
    console.log(`********* ${src}`);
    fs.readdirSync(src).forEach(file => {
        if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
            if (isRunCandidate(rule, file))
                runs.push(file);
        }
    });
    return runs;
}


//TODO: colocar toda a validação aqui, incluindo a questão de olhar os arquivos que devem existir (exemplo copyCompleted)

function isRunCandidate(rule) {
    if (rule.fileSkip) {
        return fs.existsSync(rule.fileSkip);
    }
    return false;
}

function isRunCandidate(rule, source, run) {
    //console.log(`running isRunCandidate fileskip: ${rule.fileSkip}  src: ${source} run: ${run}`);
    if (rule.fileSkip) {
        const fullPath = path.join(source, run, rule.fileSkip);
        console.log(`....yes ${fullPath}`);
        let fileSkipExist = fs.existsSync(fullPath);
        if (fileSkipExist) {
            return false;
        } else {
            rule.files.forEach(file => {
                console.log(`Olhando o file ${file.filename}`);
                if (!fs.existsSync(path.join(source, run, file.filename))) {
                    return false;
                }
                if (file.fileContent) {
                    fs.readFile(path.join(source, run, file.filename), function (err, data) {
                        if (err) throw err;
                        if (data.includes(file.fileContent)) {
                            console.log(`opa ----> ${data}`);
                        }else{
                            return false;
                        }
                    });
                }

            });
            console.log(`oooooooooooooooooooooooooooo ${fullPath}`);
            return true;
        }

    }
    return false;
}



function callJenkins(run) {
    console.log(`Call Jenkins to run ${run}`);
}

//    var jenkins = jenkinsapi.init('http://user:hash@localhost:8080');
//
//    jenkins.build('tst1', function(err, data) {
//        if (err){ return console.log(`Ops: Error \n ${err}`); }
//        console.log(`It's ok ${data}`);
//      });
//
//curl -X POST http://localhost:8080/job/tst1/build --user user:hash;


function runAsDaemon() {
    console.log(`Running at ${conf.cron}`)
    let task = cron.schedule(conf.cron, () => {
        console.log('stoped task');
        main();
    }, {
        scheduled: false
    });

    task.start();
}

main();
//runAsDaemon();
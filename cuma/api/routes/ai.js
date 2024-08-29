import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/compareUnits", async (req, res) => {
  /**
     * This queries Gemini AI to determine best matching unit Y to unit X, from set [Y,Z,...]
     * 
     *  requestbody payload = {
            unitSRC:{
                "FIT3171":{
                    "unitTitle":"Databases",
                    "unitDescription":"This unit will provide an introduction to the concepts of database design and usage and the related issues of data management. You will develop skills in planning, designing, and implementing a data model using an enterprise-scale relational database system (Oracle). Methods and techniques will also be presented to populate, retrieve, update and implement integrity features on data in the implemented database system.",
                }
            },
            unitsToCompare:{
                "FIT5137":{
                    "unitTitle":"Advanced database technology",
                    "unitDescription":"This unit examines advanced database technology. This unit particularly covers three main types of advanced database technologies, including (i) document store, (ii) wide column store, and (iii) graph database. These three systems represent the broad spectrum of NoSQL databases. The underlying theoretical foundations, such as database modelling", 
                },
                "FIT5129":{
                    "unitTitle":"Cyber operations",
                    "unitDescription":"An effective cybersecurity practitioner requires knowledge from multiple disciplines, including computer science, mathematics, psychology, sociology, criminology, law, economics, and engineering. This unit considers the intersection of the technical, psychological, and sociological aspects involved in maintaining security within organisations. The unit will provide students with practical foundations in planning secure networks, policy-based operations, and the implementation of security. Students will also be introduced to best practices in dealing with security breaches. Critical reflective and practical skills will be acquired through reflective reading and considering real-world applications.",
                }
            }
        }
     * 
     * returns json response = {
     *      "unitID1":int,
     *      "unitID2":int,
     *        ...         
     * }
     * code: 200 - if no error
     * code: 500 - if server error or other errors occured
     *  
     */
  try {
    // get the client
    const client = req.client;

    // get the request url params
    const params = req.query;

    const unitSRC = req.body.unitSRC;
    const unitsToCompare = req.body.unitsToCompare;

    const prompt =
      "Please analyse the similarity between this unit: " +
      JSON.stringify(unitSRC) +
      "And the following units: " +
      JSON.stringify(unitsToCompare) +
      "Please provide your results in a json object with the keys being the unit codes of each unit and their respective value an integer in range [1,10]. Do not provide any other text aside from this json object.";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    return res.json(text);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
});

export default router;

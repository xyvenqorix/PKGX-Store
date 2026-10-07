import { MongoClient, ObjectId } from "mongodb";


const uri =
    process.env.MONGODB_URI;


if (!uri) {

    throw new Error(
        "Falta MONGODB_URI en Vercel"
    );

}


let clientPromise;


if (!globalThis.mongoClientPromise) {

    const client =
        new MongoClient(uri);

    globalThis.mongoClientPromise =
        client.connect();

}


clientPromise =
    globalThis.mongoClientPromise;


export default async function handler(
    req,
    res
) {

    try {

        const client =
            await clientPromise;


        const db =
            client.db("pkgxstore");


        const apps =
            db.collection("apps");


        /* =========================
           GET
        ========================= */

        if (
            req.method === "GET"
        ) {

            const result =
                await apps
                    .find({})
                    .sort({
                        createdAt: -1
                    })
                    .toArray();


            return res
                .status(200)
                .json(result);

        }


        /* =========================
           POST
        ========================= */

        if (
            req.method === "POST"
        ) {

            const {
                name,
                image,
                download,
                version,
                category
            } = req.body;


            if (
                !name ||
                !image ||
                !download ||
                !version ||
                !category
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            "Todos los campos son obligatorios"

                    });

            }


            const newApp = {

                name:
                    String(name).trim(),

                image:
                    String(image).trim(),

                download:
                    String(download).trim(),

                version:
                    String(version).trim(),

                category:
                    String(category).trim(),

                createdAt:
                    new Date()

            };


            const result =
                await apps.insertOne(
                    newApp
                );


            return res
                .status(201)
                .json({

                    message:
                        "Aplicación publicada correctamente",

                    id:
                        result.insertedId

                });

        }


        /* =========================
           DELETE
        ========================= */

        if (
            req.method === "DELETE"
        ) {

            const {
                id
            } = req.query;


            if (!id) {

                return res
                    .status(400)
                    .json({

                        error:
                            "Falta el ID de la aplicación"

                    });

            }


            if (
                !ObjectId.isValid(id)
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            "ID inválido"

                    });

            }


            await apps.deleteOne({

                _id:
                    new ObjectId(id)

            });


            return res
                .status(200)
                .json({

                    message:
                        "Aplicación eliminada"

                });

        }


        return res
            .status(405)
            .json({

                error:
                    "Método no permitido"

            });


    } catch (error) {

        console.error(error);


        return res
            .status(500)
            .json({

                error:
                    "No se pudieron procesar las aplicaciones"

            });

    }

}

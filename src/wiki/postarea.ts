import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MongoClient } from 'mongodb';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        // Replace the connection string with your MongoDB connection string
        const uri = 'mongodb+srv://cosmicgateway:zq3WbPdNE9qJme6r@cosmicgateway.wbqw6iz.mongodb.net/?retryWrites=true&w=majority';

        const area = {
            name: "area1",
            description: "area1 description",
        };

        // Connect to MongoDB
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        // Access the database and collection
        const database = client.db('<database-name>');
        const collection = database.collection('<collection-name>');

        // Insert a document
        const result = await collection.insertOne(area);

        // Close the MongoDB connection
        await client.close();

        return {
            statusCode: 200,
            body: JSON.stringify({ area, insertedId: result.insertedId }),
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};

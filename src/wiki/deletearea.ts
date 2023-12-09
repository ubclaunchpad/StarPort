import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MongoClient, ObjectId } from 'mongodb';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        // Replace the connection string with your MongoDB connection string
        const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
        const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

        const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cosmicgateway.wbqw6iz.mongodb.net/?retryWrites=true&w=majority`;

        // Connect to MongoDB
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        // Access the database and collection
        const database = client.db('your-database-name'); // Replace with your actual database name
        const collection = database.collection('your-collection-name'); // Replace with your actual collection name

        // Insert a document for demonstration purposes
        const area = {
            name: "area1",
            description: "area1 description",
        };
        const insertResult = await collection.insertOne(area);

        // Delete the inserted document based on its _id
        const query = { _id: new ObjectId(insertResult.insertedId) };
        const deleteResult = await collection.deleteOne(query);

        // Close the MongoDB connection
        await client.close();

        if (deleteResult.deletedCount === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Document deleted successfully' }),
            };
        } else {
            return {
                statusCode: 404, // Not Found
                body: JSON.stringify({ error: 'Document not found or already deleted' }),
            };
        }
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MongoClient } from 'mongodb';

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
        const database = client.db('<database-name>');
        const collection = database.collection('<collection-name>');

        // Retrieve a document (based on your criteria)
        const query = { name: "area1" }; // Replace with your actual query criteria
        const result = await collection.findOne(query);

        // Close the MongoDB connection
        await client.close();

        if (result) {
          console.log('Retrieved Document:', result); // Log the retrieved document
          return {
              statusCode: 200,
              body: JSON.stringify({ area: result }),
          };
      } else {
          return {
              statusCode: 404, // Not Found
              body: JSON.stringify({ error: 'Document not found' }),
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

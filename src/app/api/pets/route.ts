import { Client } from '@petfinder/petfinder-js';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = 'nodejs';
// load env variables

const client = new Client({ apiKey: process.env.API_KEY!, secret: process.env.SECRET! });
 
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const breeds = searchParams.get('breeds');
    const type = searchParams.get('type');
    const size = searchParams.get('size');
    const location = searchParams.get('location');
    const gender = searchParams.get('gender'); // can only be 'male' or 'female', or 'unknown'
    const age = searchParams.get('age'); // age can only be 'baby', 'young', 'adult', or 'senior'
    const searchParamsObject: any = {
        limit: 100,
    };


    if (breeds) {
        searchParamsObject.breed = breeds;
    }

    if (type) {
        searchParamsObject.type = type;
    }

    if (size) {
        searchParamsObject.size = size;
    }

    if (location) {
        searchParamsObject.location = location;
    }

    if (gender) {
        searchParamsObject.gender = gender;
    }

    if (age) {
        searchParamsObject.age = age;
    }

    const pets = await client.animal.search(
        searchParamsObject
    )

    const allAnimals = pets.data.animals;

    // process tne animal data
    const processedAnimals = allAnimals.map((animal: any) => {
        return {
            photo: animal.photos.map((photo: any) => photo.full),
            contact: animal.contact,
            link: animal.url,
            description: animal.description,
            name: animal.name,
            age: animal.age,
            gender: animal.gender,
            size: animal.size,
            breed: animal.breeds.primary,
            type: animal.type,
            id: animal.id,
        }
    })

    return Response.json(processedAnimals);
}
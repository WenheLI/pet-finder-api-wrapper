import { Client } from '@petfinder/petfinder-js';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = 'nodejs';
// load env variables

const client = new Client({ apiKey: process.env.API_KEY!, secret: process.env.SECRET! });

export async function POST(request: Request) {
    // logging the request
    const requestBody = await request.json();
    console.log(`Request: ${JSON.stringify(requestBody)}`);
    const { breeds = null, type = null, size = null, location = null, gender = null, age = null, color = null, pageSize = 20 } = requestBody;
    // logging the request
    console.log(`Request: breeds: ${breeds}, type: ${type}, size: ${size}, location: ${location}, gender: ${gender}, age: ${age}, color: ${color}, pageSize: ${pageSize}`);
    // also parse the page size from url: /api/pets?pageSize=20
    const url = new URL(request.url);
    const pageSizeFromUrl = url.searchParams.get('pageSize');
    let parsedPageSize = null;
    if (pageSizeFromUrl) {
        parsedPageSize = parseInt(pageSizeFromUrl);
    }
    const searchParamsObject: any = {
        limit: parsedPageSize || pageSize
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

    if (color) {
        searchParamsObject.color = color;
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
            color: animal.colors.primary,
        }
    })

    return Response.json(processedAnimals);
}
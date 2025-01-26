import { Workbook } from 'exceljs';
import { Client } from '@petfinder/petfinder-js';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = 'nodejs';
const client = new Client({ apiKey: process.env.API_KEY!, secret: process.env.SECRET! });

export async function POST(request: Request) {
    // get data from the request
    let data = await request.text();
    let parsedData = null;  
    try {
        console.log(data);
        parsedData = data.replace(/None/g, 'null').replace(/False/g, 'false').replace(/True/g, 'true').replace(/\\/g, '').replace(/\\n/g, '').replace(/\\t/g, '').trim();
        parsedData = parsedData.slice(1, -1);
        parsedData = JSON.parse(parsedData.replace(/None/g, 'null').replace(/False/g, 'false').replace(/True/g, 'true').replace(/\\/g, '').replace(/\\n/g, '').replace(/\\t/g, ''));
    } catch (error) {
        console.error(`Error parsing request body: ${error}`);
    }
    const url = new URL(request.url);
    const debugFlag = url.searchParams.get('debug') ? true : false;
    // data should be
    // {
    //     animals: [
    //         {
    //             id: 1,
    //             matchRate: 0.8,
    //             whyMatch: 'This is a test why match',
    //         }
    //     ],
    //     introduction: 'This is a test introduction',
    // }
    
    console.log(parsedData);

    const animalIds = parsedData.animals.map((animal: any) => animal.id);
    const animalsRequests = animalIds.map((id: number) => client.animal.show(id));
    const animals = await Promise.all(animalsRequests);
    const animalsData = animals.map((animal: any) => {
        return {
            name: animal.data.animal.name,
            photo: animal.data.animal.photos[0]?.full || null,
            matchRate: parsedData.animals.find((thisAnimal: any) => animal.data.animal.id === thisAnimal.id).matchRate,
            whyMatch: parsedData.animals.find((thisAnimal: any) => animal.data.animal.id === thisAnimal.id).whyMatch,
            location: animal.data.animal.contact.address.city,
            contact: animal.data.animal.contact.email,
            info: animal.data.animal.description,
            age: animal.data.animal.age,
            sex: animal.data.animal.gender,
            contacted: 'Pending'
        }
    })


    // create a new workbook
    const workbook = new Workbook();
    // create a new worksheet
    const worksheet = workbook.addWorksheet('Progress Tracker');
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 15 },
        { header: 'Photo', key: 'photo', width: 15 },
        { header: 'Match Rate', key: 'matchRate', width: 15 },
        { header: 'Info', key: 'info', width: 15 },
        { header: 'Location', key: 'location', width: 15 },
        { header: 'Contact', key: 'contact', width: 15 },
        { header: 'Contacted', key: 'contacted', width: 15 },
        { header: 'Why Match', key: 'whyMatch', width: 15 },
        { header: 'My Thoughts', key: 'myThoughts', width: 15 },
        { header: 'Sex', key: 'sex', width: 15 },
        { header: 'Age', key: 'age', width: 15 },
    ];
    for (const row of animalsData) {
        worksheet.addRow(row);
    }
    // create a dropdown menu for the Progress column with the following options: 'Contacted', 'Met', 'Scheduled', 'Pending', 'Rejected'
    worksheet.getColumn('G').eachCell((cell, index) => {
        if (index > 1) {
            cell.dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: true,
                prompt: 'Please select a progress',
                formulae: ['"Contacted,Met,Scheduled,Pending,Rejected"']
            }
        }
    });

    const introductionWorksheet = workbook.addWorksheet('Introduction');
    introductionWorksheet.columns = [
        { header: 'Text', key: 'text', width: 15 },
    ]
    introductionWorksheet.addRow({ text: parsedData.introduction });

    const base64Excel = await workbook.xlsx.writeBuffer();
    if (!debugFlag) {
        //@ts-ignore
        const base64ExcelString = base64Excel.toString('base64');
        // return a base64 string only without the json format
        return new Response(base64ExcelString)
    }
    else {
        // return the excel file
        return new Response(base64Excel, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="progress-tracker.xlsx"',
            },
        });
    }
}

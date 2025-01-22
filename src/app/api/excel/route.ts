import { Workbook } from 'exceljs';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = 'nodejs';

export async function POST(request: Request) {
    // get data from the request
    const data = await request.json();
    console.log(data);

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
        { header: 'Progress', key: 'progress', width: 15 },
        { header: 'My Thoughts', key: 'myThoughts', width: 15 },
    ];
    for (const row of data.animals) {
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
    introductionWorksheet.addRow({ text: data.introduction });

    const base64Excel = await workbook.xlsx.writeBuffer();
    //@ts-ignore
    const base64ExcelString = base64Excel.toString('base64');
    return Response.json({ base64ExcelString });
}

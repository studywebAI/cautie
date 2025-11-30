
import { genkit } from 'genkit';
import { NextRequest } from 'next/server';
import { generateTitle } from '@lib/ai/flows/title-generator';

export const POST = genkit({
    flows: [generateTitle],
    options: {
        auth: async (req: NextRequest) => {
            // IMPORTANT: Implement your own authentication logic here.
            // This is a placeholder and should not be used in production.
            // For example, you could check for a valid session or API key.
            return { authenticated: true, user: null }; 
        },
    },
});

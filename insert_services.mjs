import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmipppjileezprazjwex.supabase.co';
const supabaseKey = 'sb_publishable_8BgiW4-VM4GRP6qsQ0QAhA_nYEfmzyC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: category } = await supabase.from('service_categories').select('id').eq('id', 'errands').single();
  if (!category) {
    console.log('No errands category found, creating it...');
    await supabase.from('service_categories').insert({ id: 'errands', title: 'Daily Errands', sort_order: 1 });
  }

  const { error } = await supabase.from('services').insert([
    {
      category_id: 'errands',
      title: 'Groceries Delivery',
      estimated_time: '1-2 hours',
      documents_needed: ['Shopping List', 'Approximate Budget'],
      steps: ['Add your items to the list', 'Volunteer accepts and shops', 'Volunteer delivers to you'],
      sort_order: 1
    },
    {
      category_id: 'errands',
      title: 'Medicine Pickup',
      estimated_time: '1 hour',
      documents_needed: ['Prescription (if required)', 'Pharmacy Name (optional)'],
      steps: ['List required medicines', 'Volunteer visits pharmacy', 'Volunteer delivers to you'],
      sort_order: 2
    }
  ]);

  if (error) {
    console.error('Error inserting services:', error);
  } else {
    console.log('Successfully inserted errand services!');
  }
}

run();

insert into public.films (title, youtube_id, type, description)
values
  (
    'Do Deewane Shehar Mein',
    'mxrZxACMp7c',
    'Short film',
    'Some stories are not just watched; they are felt. A story of emotions, connections, and moments that stay with you long after the screen fades to black.'
  ),
  (
    'Do Deewane Shehar Mein — Official Teaser',
    'jwv7UvRIkq8',
    'Official teaser',
    'A romantic journey filled with love, emotions, dreams, and the beautiful madness of being together.'
  ),
  (
    'Boozing All The Night',
    '2iRJMgZjyJU',
    'Original song · My Russian Girlfriend',
    'One beat. One vibe. No rules. The high-energy official song from My Russian Girlfriend, packed with friendship and unforgettable moments.'
  ),
  (
    'My Russian Girlfriend',
    '_o9Hulw0F8o',
    'Short film',
    'A social thriller and drama that questions how society judges people based on where they come from.'
  ),
  (
    'My Russian Girlfriend — Official Teaser',
    '4UgbfiAnV5I',
    'Official teaser',
    'A gripping social thriller where attraction meets deception, and nothing is quite what it seems.'
  ),
  (
    'Fridge',
    '7Frk4yDgxzk',
    'Short film',
    'A Hindi short film featuring Yash Raut, Shweta Maskare, Soumya Keshri, and Spandana Mehta. Written by Abhay Anand Singh and directed by Ashutosh Mishra.'
  ),
  (
    'Fade',
    'OjWzTB5c1-M',
    'Short film',
    'Where every note tells a story. A Hindi short film featuring Siddhant Rao and Shweta Maskare, written by Shubham Maurya and directed by Prins Singh.'
  ),
  (
    'Anita',
    'kPytRu00Ac8',
    'Short film',
    'A psychological drama featuring Siddhant Rao and Deepika Negi, written and directed by Nakshatra Singh.'
  ),
  (
    'Ankaha',
    'uCrkJ1uzqv0',
    'Short film',
    'A musical Hindi short film featuring Abhay Anand Singh and Deepika Negi, written by Abhay Anand Singh and directed by Ashutosh Mishra.'
  ),
  (
    'Litti Chokha',
    '4CSTwCcELJY',
    'Short film',
    'A Hindi short film featuring Vaibhav Singh and Juhi Arora, written and directed by Nakshatra Singh.'
  ),
  (
    'Bus Ek Pyar',
    'n8spKBH_2PE',
    'Short film',
    'A suspense drama featuring Gaurav Singh and Swapneel Dixit, written and directed by Nakshatra Singh.'
  ),
  (
    'Roadcross',
    'Dwa_zvZ0Tdg',
    'Short film',
    'A micro award-winning Hindi short film featuring Aarika Ghatak, Arnab Ghatak, and Subhadip Chakraborty. Written and directed by Arnab Ghatak.'
  )
on conflict (youtube_id) do update
set
  title = excluded.title,
  type = excluded.type,
  description = excluded.description;

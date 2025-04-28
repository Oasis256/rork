import { ServerConfig, User, Library, Book, Chapter, AudioTrack } from '@/types/audiobookshelf';

const API_VERSION = 'v1';

export async function login(server: ServerConfig): Promise<User> {
  try {
    // Check if this is a mock server request
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      // Return mock user data for demo mode
      return {
        id: 'demo-user',
        username: server.username || 'demo',
        token: 'demo-token',
      };
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: server.username,
        password: server.password,
      }),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Login failed';
      
      try {
        // Try to parse error as JSON if possible
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If parsing fails, use the raw text or a default message
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Check if response has content before parsing
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Server returned an empty response');
    }

    // Parse the JSON response
    const data = JSON.parse(responseText);
    
    if (!data.user || !data.user.token) {
      throw new Error('Invalid server response: missing user data');
    }

    return {
      id: data.user.id,
      username: data.user.username,
      token: data.user.token,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function getLibraries(server: ServerConfig, token: string): Promise<Library[]> {
  try {
    // Return mock data for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      return [
        {
          id: 'lib-1',
          name: 'Audiobooks',
          itemCount: 12,
        },
        {
          id: 'lib-2',
          name: 'Podcasts',
          itemCount: 5,
        }
      ];
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/libraries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch libraries';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.libraries.map((lib: any) => ({
      id: lib.id,
      name: lib.name,
      cover: lib.cover || undefined,
      itemCount: lib.mediaCount || 0,
    }));
  } catch (error) {
    console.error('Get libraries error:', error);
    throw error;
  }
}

export async function getBooks(server: ServerConfig, token: string, libraryId: string): Promise<Book[]> {
  try {
    // Return mock data for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      return getMockBooks(libraryId);
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/libraries/${libraryId}/items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch books';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.media.metadata.title,
      authors: item.media.metadata.authors?.map((author: any) => ({
        id: author.id,
        name: author.name,
      })) || [],
      series: item.media.metadata.series ? {
        id: item.media.metadata.series.id,
        name: item.media.metadata.series.name,
        sequence: item.media.metadata.series.sequence,
      } : undefined,
      cover: item.media.coverPath ? `${server.url}/api/${API_VERSION}/items/${item.id}/cover` : undefined,
      description: item.media.metadata.description,
      duration: item.media.duration || 0,
      progress: item.progress?.progress || 0,
      narrators: item.media.metadata.narrators,
      publishedYear: item.media.metadata.publishedYear,
      genres: item.media.metadata.genres,
      path: item.media.path,
    }));
  } catch (error) {
    console.error('Get books error:', error);
    throw error;
  }
}

export async function getBookDetails(server: ServerConfig, token: string, bookId: string): Promise<Book> {
  try {
    // Return mock data for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      const allBooks = [...getMockBooks('lib-1'), ...getMockBooks('lib-2')];
      const book = allBooks.find(b => b.id === bookId);
      if (!book) {
        throw new Error('Book not found');
      }
      return book;
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/items/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch book details';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const item = await response.json();
    return {
      id: item.id,
      title: item.media.metadata.title,
      authors: item.media.metadata.authors?.map((author: any) => ({
        id: author.id,
        name: author.name,
      })) || [],
      series: item.media.metadata.series ? {
        id: item.media.metadata.series.id,
        name: item.media.metadata.series.name,
        sequence: item.media.metadata.series.sequence,
      } : undefined,
      cover: item.media.coverPath ? `${server.url}/api/${API_VERSION}/items/${item.id}/cover` : undefined,
      description: item.media.metadata.description,
      duration: item.media.duration || 0,
      progress: item.progress?.progress || 0,
      narrators: item.media.metadata.narrators,
      publishedYear: item.media.metadata.publishedYear,
      genres: item.media.metadata.genres,
      path: item.media.path,
    };
  } catch (error) {
    console.error('Get book details error:', error);
    throw error;
  }
}

export async function getBookChapters(server: ServerConfig, token: string, bookId: string): Promise<Chapter[]> {
  try {
    // Return mock data for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      return getMockChapters();
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/items/${bookId}/chapters`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch chapters';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.chapters.map((chapter: any, index: number) => ({
      id: chapter.id || `chapter-${index}`,
      title: chapter.title || `Chapter ${index + 1}`,
      start: chapter.start,
      end: chapter.end,
    }));
  } catch (error) {
    console.error('Get chapters error:', error);
    throw error;
  }
}

export async function getAudioTracks(server: ServerConfig, token: string, bookId: string): Promise<AudioTrack[]> {
  try {
    // Return mock data for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      return [
        {
          id: 'track-1',
          index: 0,
          path: 'https://example.com/audio.mp3',
          duration: 3600,
          startOffset: 0,
        }
      ];
    }

    const response = await fetch(`${server.url}/api/${API_VERSION}/items/${bookId}/audio-tracks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch audio tracks';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || `Server returned ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.tracks.map((track: any, index: number) => ({
      id: track.id || `track-${index}`,
      index: track.index || index,
      path: `${server.url}/api/${API_VERSION}/items/${bookId}/audio-tracks/${index}`,
      duration: track.duration || 0,
      startOffset: track.startOffset || 0,
    }));
  } catch (error) {
    console.error('Get audio tracks error:', error);
    throw error;
  }
}

export async function updateProgress(
  server: ServerConfig, 
  token: string, 
  bookId: string, 
  currentTime: number, 
  duration: number
): Promise<void> {
  try {
    // Skip for demo mode
    if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
      return;
    }

    const progress = duration > 0 ? currentTime / duration : 0;
    
    await fetch(`${server.url}/api/${API_VERSION}/me/progress/${bookId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress,
        currentTime,
        duration,
      }),
    });
  } catch (error) {
    console.error('Update progress error:', error);
    throw error;
  }
}

export function getStreamUrl(server: ServerConfig, token: string, bookId: string): string {
  // Return a sample audio URL for demo mode
  if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
    return 'https://ia800501.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act1_shakespeare.mp3';
  }
  return `${server.url}/api/${API_VERSION}/items/${bookId}/play?token=${token}`;
}

export function getCoverUrl(server: ServerConfig, token: string, bookId: string): string {
  // Return a sample cover URL for demo mode
  if (server.url === 'demo' || server.url === 'http://demo' || server.url === 'https://demo') {
    const mockBooks = [...getMockBooks('lib-1'), ...getMockBooks('lib-2')];
    const book = mockBooks.find(b => b.id === bookId);
    return book?.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2787&auto=format&fit=crop';
  }
  return `${server.url}/api/${API_VERSION}/items/${bookId}/cover?token=${token}`;
}

// Mock data functions
function getMockBooks(libraryId: string): Book[] {
  if (libraryId === 'lib-1') {
    return [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        authors: [{ id: 'author-1', name: 'F. Scott Fitzgerald' }],
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2787&auto=format&fit=crop',
        description: 'A novel about the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
        duration: 9000,
        progress: 0.3,
        narrators: ['Jake Gyllenhaal'],
        publishedYear: 1925,
        genres: ['Classic', 'Fiction'],
      },
      {
        id: 'book-2',
        title: 'To Kill a Mockingbird',
        authors: [{ id: 'author-2', name: 'Harper Lee' }],
        cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2788&auto=format&fit=crop',
        description: 'The story of Scout Finch and her father, a lawyer who defends a Black man accused of raping a white woman in the Deep South.',
        duration: 11000,
        progress: 0,
        narrators: ['Sissy Spacek'],
        publishedYear: 1960,
        genres: ['Classic', 'Fiction', 'Coming of Age'],
      },
      {
        id: 'book-3',
        title: '1984',
        authors: [{ id: 'author-3', name: 'George Orwell' }],
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop',
        description: 'A dystopian novel set in a totalitarian society where critical thought is suppressed.',
        duration: 12000,
        progress: 0.7,
        narrators: ['Simon Prebble'],
        publishedYear: 1949,
        genres: ['Dystopian', 'Science Fiction', 'Classic'],
      },
      {
        id: 'book-4',
        title: 'Pride and Prejudice',
        authors: [{ id: 'author-4', name: 'Jane Austen' }],
        series: { id: 'series-1', name: 'Austen Classics', sequence: 1 },
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2787&auto=format&fit=crop',
        description: 'The story follows the main character, Elizabeth Bennet, as she deals with issues of manners, upbringing, morality, education, and marriage.',
        duration: 13000,
        progress: 0.1,
        narrators: ['Rosamund Pike'],
        publishedYear: 1813,
        genres: ['Classic', 'Romance'],
      },
      {
        id: 'book-5',
        title: 'The Hobbit',
        authors: [{ id: 'author-5', name: 'J.R.R. Tolkien' }],
        series: { id: 'series-2', name: 'Middle-Earth', sequence: 1 },
        cover: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=2835&auto=format&fit=crop',
        description: 'The adventure of Bilbo Baggins, a hobbit who is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor.',
        duration: 11500,
        progress: 0,
        narrators: ['Andy Serkis'],
        publishedYear: 1937,
        genres: ['Fantasy', 'Adventure'],
      },
    ];
  } else {
    return [
      {
        id: 'podcast-1',
        title: 'Science Weekly',
        authors: [{ id: 'author-6', name: 'The Guardian' }],
        cover: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?q=80&w=2787&auto=format&fit=crop',
        description: 'The award-winning Science Weekly podcast is the best place to learn about the big discoveries and debates in biology, chemistry, physics and sometimes even maths.',
        duration: 3600,
        progress: 0.5,
        narrators: ['Ian Sample', 'Hannah Devlin'],
        publishedYear: 2022,
        genres: ['Science', 'Education'],
      },
      {
        id: 'podcast-2',
        title: 'History Extra',
        authors: [{ id: 'author-7', name: 'BBC History Magazine' }],
        cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2874&auto=format&fit=crop',
        description: 'The latest news from the team behind BBC History Magazine - a popular History magazine.',
        duration: 4500,
        progress: 0.2,
        narrators: ['David Musgrove', 'Charlotte Hodgman'],
        publishedYear: 2022,
        genres: ['History', 'Education'],
      },
    ];
  }
}

function getMockChapters(): Chapter[] {
  return [
    {
      id: 'chapter-1',
      title: 'Chapter 1: The Beginning',
      start: 0,
      end: 1200,
    },
    {
      id: 'chapter-2',
      title: 'Chapter 2: The Journey',
      start: 1200,
      end: 2400,
    },
    {
      id: 'chapter-3',
      title: 'Chapter 3: The Challenge',
      start: 2400,
      end: 3600,
    },
    {
      id: 'chapter-4',
      title: 'Chapter 4: The Discovery',
      start: 3600,
      end: 4800,
    },
    {
      id: 'chapter-5',
      title: 'Chapter 5: The Resolution',
      start: 4800,
      end: 6000,
    },
  ];
}
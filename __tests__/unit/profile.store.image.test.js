// Tests de stores/profile.store.image.js: resolveAvatarUrl/isStorageAvatarPath y guardas de path null (mockea supabase y expo-file-system).

jest.mock("@/lib/supabase", () => {
  const storageApi = {
    from: jest.fn(),
  };
  return { supabase: { storage: storageApi } };
});

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
}));

import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";
import {
  uploadAvatar,
  resolveAvatarUrl,
  isStorageAvatarPath,
  getAvatarSignedUrl,
  deleteAvatar,
} from "@/stores/profile.store.image";

// Builder del bucket de Storage con las operaciones usadas.
function mockBucket({ createSignedUrl, remove } = {}) {
  const bucket = {
    createSignedUrl: jest.fn().mockResolvedValue(
      createSignedUrl ?? {
        data: { signedUrl: "https://signed/avatar" },
        error: null,
      },
    ),
    remove: jest.fn().mockResolvedValue(remove ?? { error: null }),
  };
  supabase.storage.from.mockReturnValue(bucket);
  return bucket;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// Builder del bucket con la operación upload.
function mockUploadBucket(resolved = { error: null }) {
  const bucket = { upload: jest.fn().mockResolvedValue(resolved) };
  supabase.storage.from.mockReturnValue(bucket);
  return bucket;
}

// ─── uploadAvatar ─────────────────────────────────────────────────────────────

describe("uploadAvatar", () => {
  it("sube a {uid}/avatar.jpg (nombre fijo + upsert, sin huérfanos) y devuelve el path", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    File.mockImplementation(() => ({
      bytes: jest.fn().mockResolvedValue(bytes),
    }));
    const bucket = mockUploadBucket({ error: null });

    const path = await uploadAvatar({
      uri: "file:///tmp/x.jpg",
      userId: "uid-9",
    });

    expect(path).toBe("uid-9/avatar.jpg");
    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(bucket.upload).toHaveBeenCalledWith(
      "uid-9/avatar.jpg",
      bytes,
      expect.objectContaining({ contentType: "image/jpeg", upsert: true }),
    );
  });

  it("relanza si la subida falla", async () => {
    File.mockImplementation(() => ({
      bytes: jest.fn().mockResolvedValue(new Uint8Array()),
    }));
    const error = { message: "upload failed" };
    mockUploadBucket({ error });

    await expect(
      uploadAvatar({ uri: "file:///tmp/x.jpg", userId: "uid-9" }),
    ).rejects.toBe(error);
  });
});

// ─── isStorageAvatarPath ──────────────────────────────────────────────────────

describe("isStorageAvatarPath", () => {
  it("una URL http(s) NO es path de Storage (es OAuth externo)", () => {
    expect(isStorageAvatarPath("https://lh3.googleusercontent.com/a/x")).toBe(
      false,
    );
    expect(isStorageAvatarPath("http://example.com/p.jpg")).toBe(false);
  });

  it("un path de Storage sí lo es", () => {
    expect(isStorageAvatarPath("uid-123/avatar.jpg")).toBe(true);
  });

  it("vacío / null / undefined → false", () => {
    expect(isStorageAvatarPath("")).toBe(false);
    expect(isStorageAvatarPath(null)).toBe(false);
    expect(isStorageAvatarPath(undefined)).toBe(false);
  });
});

// ─── resolveAvatarUrl ─────────────────────────────────────────────────────────

describe("resolveAvatarUrl", () => {
  it("null / vacío → null (se usará el icono por defecto)", async () => {
    expect(await resolveAvatarUrl(null)).toBeNull();
    expect(await resolveAvatarUrl("")).toBeNull();
  });

  it("URL externa de OAuth → se devuelve tal cual, sin firmar", async () => {
    const url = "https://lh3.googleusercontent.com/a/foto";
    const result = await resolveAvatarUrl(url);

    expect(result).toBe(url);
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("path de Storage → genera y devuelve una URL firmada", async () => {
    const bucket = mockBucket({
      createSignedUrl: {
        data: { signedUrl: "https://signed/avatar.jpg" },
        error: null,
      },
    });

    const result = await resolveAvatarUrl("uid-123/avatar.jpg");

    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(bucket.createSignedUrl).toHaveBeenCalledWith(
      "uid-123/avatar.jpg",
      expect.any(Number),
    );
    expect(result).toBe("https://signed/avatar.jpg");
  });
});

// ─── getAvatarSignedUrl ───────────────────────────────────────────────────────

describe("getAvatarSignedUrl", () => {
  it("path null → null sin tocar Storage", async () => {
    expect(await getAvatarSignedUrl(null)).toBeNull();
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("firma el path y devuelve la URL", async () => {
    mockBucket({
      createSignedUrl: { data: { signedUrl: "https://s/u.jpg" }, error: null },
    });

    expect(await getAvatarSignedUrl("u/a.jpg")).toBe("https://s/u.jpg");
  });

  it("relanza si createSignedUrl falla", async () => {
    const error = { message: "not found" };
    mockBucket({ createSignedUrl: { data: null, error } });

    await expect(getAvatarSignedUrl("u/a.jpg")).rejects.toBe(error);
  });
});

// ─── deleteAvatar ─────────────────────────────────────────────────────────────

describe("deleteAvatar", () => {
  it("path null → no llama a remove", async () => {
    await deleteAvatar(null);
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("borra el path indicado", async () => {
    const bucket = mockBucket();

    await deleteAvatar("u/a.jpg");

    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(bucket.remove).toHaveBeenCalledWith(["u/a.jpg"]);
  });

  it("relanza si remove falla", async () => {
    const error = { message: "storage error" };
    mockBucket({ remove: { error } });

    await expect(deleteAvatar("u/a.jpg")).rejects.toBe(error);
  });
});

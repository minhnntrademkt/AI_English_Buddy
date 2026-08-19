$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageProcessor
{
    public static void RemoveBackgroundBFS(string srcPath, string destPath, int threshold, int feather)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int bytes = Math.Abs(srcData.Stride) * h;
                byte[] srcBuf = new byte[bytes];
                byte[] destBuf = new byte[bytes];
                Marshal.Copy(srcData.Scan0, srcBuf, 0, bytes);

                bool[,] isBg = new bool[w, h];
                bool[,] visited = new bool[w, h];
                Queue<int> qx = new Queue<int>();
                Queue<int> qy = new Queue<int>();

                // Add 4 outer borders to flood queue
                for (int x = 0; x < w; x++)
                {
                    qx.Enqueue(x); qy.Enqueue(0); visited[x, 0] = true;
                    qx.Enqueue(x); qy.Enqueue(h - 1); visited[x, h - 1] = true;
                }
                for (int y = 1; y < h - 1; y++)
                {
                    qx.Enqueue(0); qy.Enqueue(y); visited[0, y] = true;
                    qx.Enqueue(w - 1); qy.Enqueue(y); visited[w - 1, y] = true;
                }

                while (qx.Count > 0)
                {
                    int cx = qx.Dequeue();
                    int cy = qy.Dequeue();

                    int idx = (cy * srcData.Stride) + (cx * 4);
                    byte b = srcBuf[idx];
                    byte g = srcBuf[idx + 1];
                    byte r = srcBuf[idx + 2];
                    int maxC = Math.Max(r, Math.Max(g, b));

                    if (maxC <= threshold)
                    {
                        isBg[cx, cy] = true;

                        int[] dx = { 1, -1, 0, 0 };
                        int[] dy = { 0, 0, 1, -1 };
                        for (int i = 0; i < 4; i++)
                        {
                            int nx = cx + dx[i];
                            int ny = cy + dy[i];
                            if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                            {
                                if (!visited[nx, ny])
                                {
                                    visited[nx, ny] = true;
                                    qx.Enqueue(nx);
                                    qy.Enqueue(ny);
                                }
                            }
                        }
                    }
                }

                // Render output
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        int idx = (y * srcData.Stride) + (x * 4);
                        byte b = srcBuf[idx];
                        byte g = srcBuf[idx + 1];
                        byte r = srcBuf[idx + 2];

                        if (isBg[x, y])
                        {
                            destBuf[idx] = 0;
                            destBuf[idx + 1] = 0;
                            destBuf[idx + 2] = 0;
                            destBuf[idx + 3] = 0;
                        }
                        else
                        {
                            destBuf[idx] = b;
                            destBuf[idx + 1] = g;
                            destBuf[idx + 2] = r;

                            bool nearBg = (x > 0 && isBg[x - 1, y]) ||
                                          (x < w - 1 && isBg[x + 1, y]) ||
                                          (y > 0 && isBg[x, y - 1]) ||
                                          (y < h - 1 && isBg[x, y + 1]);

                            int maxC = Math.Max(r, Math.Max(g, b));
                            if (nearBg && maxC < (threshold + feather))
                            {
                                double ratio = (double)(maxC - threshold) / feather;
                                destBuf[idx + 3] = (byte)Math.Min(255, Math.Max(0, (int)(ratio * 255)));
                            }
                            else
                            {
                                destBuf[idx + 3] = 255;
                            }
                        }
                    }
                }

                Marshal.Copy(destBuf, 0, destData.Scan0, bytes);
                src.UnlockBits(srcData);
                dest.UnlockBits(destData);
                dest.Save(destPath, ImageFormat.Png);
            }
        }
        Console.WriteLine("SUCCESS: " + destPath);
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

[ImageProcessor]::RemoveBackgroundBFS(
    "C:\Users\Home\.gemini\antigravity\brain\294f9411-74ae-46f0-a4c6-943ee5843347\.user_uploaded\media_1787045518992.jpg",
    "C:\Users\Home\.gemini\antigravity\scratch\kids_ai_english_buddy\assets\mascot_toby.png",
    35, 18
)

[ImageProcessor]::RemoveBackgroundBFS(
    "C:\Users\Home\.gemini\antigravity\brain\294f9411-74ae-46f0-a4c6-943ee5843347\mascot_alex_3d_1787045647638.jpg",
    "C:\Users\Home\.gemini\antigravity\scratch\kids_ai_english_buddy\assets\mascot_alex.png",
    35, 18
)

[ImageProcessor]::RemoveBackgroundBFS(
    "C:\Users\Home\.gemini\antigravity\brain\294f9411-74ae-46f0-a4c6-943ee5843347\mascot_leo_fullbody_1787046544716.jpg",
    "C:\Users\Home\.gemini\antigravity\scratch\kids_ai_english_buddy\assets\mascot_leo.png",
    35, 18
)

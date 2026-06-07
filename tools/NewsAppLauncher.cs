using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

internal static class NewsAppLauncher
{
    private const int DefaultPort = 3000;

    [STAThread]
    private static int Main()
    {
        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        string serverPath = Path.Combine(appDir, "server.js");

        if (!File.Exists(serverPath))
        {
            MessageBox.Show("server.js was not found next to this executable.", "News App", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }

        string nodePath = FindNode();
        if (nodePath == null)
        {
            MessageBox.Show("Node.js was not found. Install Node.js or add node.exe to PATH.", "News App", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }

        int port = SelectPort();
        string url = "http://localhost:" + port + "/";

        if (!IsNewsAppRunning(port))
        {
            try
            {
                StartServer(nodePath, appDir, port);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not start the News App server:\n\n" + ex.Message, "News App", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }

            if (!WaitForServer(port))
            {
                MessageBox.Show("The News App server did not start in time.", "News App", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return 1;
            }
        }

        OpenBrowser(url);
        return 0;
    }

    private static string FindNode()
    {
        string[] candidates = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "node.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs", "node.exe")
        };

        foreach (string candidate in candidates)
        {
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        string pathValue = Environment.GetEnvironmentVariable("PATH") ?? "";
        foreach (string dir in pathValue.Split(Path.PathSeparator))
        {
            if (string.IsNullOrWhiteSpace(dir))
            {
                continue;
            }

            try
            {
                string candidate = Path.Combine(dir.Trim('"'), "node.exe");
                if (File.Exists(candidate))
                {
                    return candidate;
                }
            }
            catch
            {
            }
        }

        return null;
    }

    private static int SelectPort()
    {
        if (IsNewsAppRunning(DefaultPort) || IsPortFree(DefaultPort))
        {
            return DefaultPort;
        }

        for (int port = 3001; port <= 3020; port++)
        {
            if (IsPortFree(port))
            {
                return port;
            }
        }

        return DefaultPort;
    }

    private static bool IsPortFree(int port)
    {
        TcpListener listener = null;
        try
        {
            listener = new TcpListener(IPAddress.Loopback, port);
            listener.Start();
            return true;
        }
        catch
        {
            return false;
        }
        finally
        {
            if (listener != null)
            {
                listener.Stop();
            }
        }
    }

    private static void StartServer(string nodePath, string appDir, int port)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = nodePath,
            Arguments = "server.js",
            WorkingDirectory = appDir,
            UseShellExecute = false,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        };

        startInfo.EnvironmentVariables["PORT"] = port.ToString();
        Process.Start(startInfo);
    }

    private static bool WaitForServer(int port)
    {
        for (int i = 0; i < 40; i++)
        {
            if (IsNewsAppRunning(port))
            {
                return true;
            }

            Thread.Sleep(250);
        }

        return false;
    }

    private static bool IsNewsAppRunning(int port)
    {
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/api/sources");
            request.Method = "GET";
            request.Timeout = 1000;
            request.ReadWriteTimeout = 1000;

            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                string body = reader.ReadToEnd();
                return response.StatusCode == HttpStatusCode.OK && body.IndexOf("\"sources\"", StringComparison.OrdinalIgnoreCase) >= 0;
            }
        }
        catch
        {
            return false;
        }
    }

    private static void OpenBrowser(string url)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        };

        Process.Start(startInfo);
    }
}

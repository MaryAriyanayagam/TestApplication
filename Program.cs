namespace TestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.WriteLine(">> Main()");

            IAnimal cat = new Cat();
            IAnimal dog = new Dog();

            cat.Speak();
            dog.Speak();

            cat.Play();
            dog.Play();
            //var cat = new Cat();

            //cat.Meow();

            //var dog = new Dog();

            //dog.Bark();

            //cat.Play();
            //dog.Play();

            System.Console.WriteLine("<< Main()");

            System.Console.WriteLine("Hit any key to exit...");
            System.Console.ReadKey();
        }
    }
}

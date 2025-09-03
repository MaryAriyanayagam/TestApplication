using TestApplication;

namespace TestProject;

public class AnimalTest
{
    public class AnimalTests
    {
        [Fact]
        public void CatSaysMeow()
        {
            // Arrange
            var cat = new Cat();
            using var sw = new StringWriter();
            Console.SetOut(sw);

            // Act
            cat.Speak();

            // Assert
            var output = sw.ToString().Trim();
            Assert.Equal("Meow!", output);
        }

        [Fact]
        public void CatPlays()
        {
            // Arrange
            var cat = new Cat();
            using var sw = new StringWriter();
            Console.SetOut(sw);

            // Act
            cat.Play();

            // Assert
            var output = sw.ToString().Trim();
            Assert.Equal("Cat is chasing its shadow...", output);
        }

        [Fact]
        public void DogSaysBark()
        {
            // Arrange
            var dog = new Dog();
            using var sw = new StringWriter();
            Console.SetOut(sw);

            // Act
            dog.Speak();

            // Assert
            var output = sw.ToString().Trim();
            Assert.Equal("Bark!", output);
        }


        [Fact]
        public void DogPlays()
        {
            // Arrange
            var dog = new Dog();
            using var sw = new StringWriter();
            Console.SetOut(sw);

            // Act
            dog.Play();

            // Assert
            var output = sw.ToString().Trim();
            Assert.Equal("Dog is chasing its tail...", output);

        }
    }
}